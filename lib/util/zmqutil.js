//
// Copyright © 2025 contains code contributed by V Kontakte LLC - Licensed under the Apache license 2.0
//
// This wrapper is designed to make 0MQ v6 backwards compatible with v5

import * as zmq from 'zeromq'
import logger from './logger.js'
import {EventEmitter} from 'events'
const log = logger.createLogger('util:zmqutil')

const reconnectDelay = 1000
const socketTypeMap = {
    pub: zmq.Publisher
    , sub: zmq.Subscriber
    , push: zmq.Push
    , pull: zmq.Pull
    , dealer: zmq.Dealer
    , router: zmq.Router
    , pair: zmq.Pair
    , req: zmq.Request
    , reply: zmq.Reply
}

class SocketWrapper extends EventEmitter {
    constructor(type) {
        super()

        if (!(type in socketTypeMap)) {
            throw new Error(`Unsupported socket type: ${type}`)
        }

        this.type = type
        this.isActive = true
        this.endpoints = new Set()

        const SocketClass = socketTypeMap[type]
        this.socket = new SocketClass()
    }

    // eslint-disable-next-line no-sync
    bindSync = (address) => this.socket.bindSync(address)

    connect(endpoint) {
        try {
            this.socket.connect(endpoint)
            this.endpoints.add(endpoint)
            log.verbose('Socket connected to:', endpoint)
        }
        catch (err) {
            log.error('Error connecting socket to', endpoint, ':', err)
            if (!this.isActive) {
                return this
            }

            setTimeout(() => {
                if (this.isActive) {
                    log.info('Attempting to reconnect socket to:', endpoint)
                    this.connect(endpoint)
                }
            }, reconnectDelay)
        }

        return this
    }

    reconnect() {
        if (!this.isActive) {
            return this
        }

        try {
            this.socket.close()
        }
        catch (err) {
            log.warn('Error closing socket during reconnect:', err)
        }

        const SocketClass = socketTypeMap[this.type]
        this.socket = new SocketClass()

        for (const endpoint of this.endpoints) {
            try {
                this.socket.connect(endpoint)
                log.verbose('Socket reconnected to:', endpoint)
            }
            catch (err) {
                log.error('Error reconnecting socket to', endpoint, ':', err)

                if (this.isActive) {
                    setTimeout(() => this.reconnect(), reconnectDelay)
                    return this
                }
            }
        }

        this.startReceiveLoop()

        return this
    }

    subscribe(topic) {
        if (this.type === 'sub') {
            this.socket.subscribe(
                typeof topic === 'string' ? Buffer.from(topic) : topic
            )
        }

        return this
    }

    unsubscribe(topic) {
        if (this.type === 'sub') {
            this.socket.unsubscribe(
                typeof topic === 'string' ? Buffer.from(topic) : topic
            )
        }
        return this
    }

    async sendAsync(args) {
        try {
            await this.socket.send(
                (Array.isArray(args) ? args : [args])
                    .map(arg => Buffer.isBuffer(arg) ? arg : Buffer.from(String(arg)))
            )
        }
        catch (err) {
            log.error('Error in send:', err && (err.message || err.toString()) || 'Unknown error')

            if (err?.message && ['closed', 'terminating', 'ECONNREFUSED'].some((m) => err.message.includes(m))) {
                log.warn('Socket connection appears to be closed, attempting to reconnect...')
                this.reconnect()
            }
        }

        return this
    }

    send(args) {
        this.sendAsync(args)
        return this
    }

    close() {
        this.isActive = false
        try {
            this.socket.close()
        }
        catch (err) {
            log.warn('Error closing socket:', err)
        }

        return this
    }

    async startReceiveLoop() {
        const isValidType =
            this.type === 'sub' ||
            this.type === 'pull' ||
            this.type === 'dealer' ||
            this.type === 'router' ||
            this.type === 'reply'

        if (!this.isActive || !isValidType) {
            return
        }

        try {
            const iterator = this.socket[Symbol.asyncIterator]()
            let result

            while (this.isActive && !(result = await iterator.next()).done) {
                const message = result.value

                if (Array.isArray(message) && !!message[0]?.toString) {
                    super.emit(
                        'message'
                        , message[0].toString()
                        , ...message.slice(1)
                    )
                }
            }
        }
        catch (err) {
            log.error('Error in message receive loop:', err && (err.message || err.toString()) || 'Unknown error')

            if (this.isActive) {
                if (err?.message && ['closed', 'terminating', 'ECONNREFUSED'].some((m) => err.message.includes(m))) {
                    log.warn('Socket connection appears to be closed, attempting to reconnect...')
                    this.reconnect()
                }
                else {
                    setTimeout(() => {
                        if (this.isActive) {
                            this.startReceiveLoop()
                        }
                    }, reconnectDelay)
                }
            }
        }
    }
}

export const socket = (type) => {
    if (!(type in socketTypeMap)) {
        throw new Error(`Unsupported socket type: ${type}`)
    }

    const wrappedSocket = new SocketWrapper(type)
    wrappedSocket.startReceiveLoop()

    return wrappedSocket
}
