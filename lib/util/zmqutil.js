//
// Copyright © 2025 contains code contributed by V Kontakte LLC - Licensed under the Apache license 2.0
//
// This wrapper is designed to make 0MQ v6 backwards compatible with v5

import * as zmq from 'zeromq'
import logger from './logger.js'
import {EventEmitter} from 'events'
const log = logger.createLogger('util:zmqutil')

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

export const socket = (type) => {
    if (!Object.prototype.hasOwnProperty.call(socketTypeMap, type)) {
        throw new Error(`Unsupported socket type: ${type}`)
    }

    const SocketClass = socketTypeMap[type]
    const originalSocket = new SocketClass()

    const emitter = new EventEmitter()

    const state = {
        endpoints: new Set()
        , isActive: true
        , reconnectDelay: 1000
    }

    const wrapper = {
        type: type

        , emit: emitter.emit.bind(emitter)
        , on: emitter.on.bind(emitter)
        , once: emitter.once.bind(emitter)
        , removeListener: emitter.removeListener.bind(emitter)

        , bindSync: originalSocket.bindSync.bind(originalSocket)

        , connect: (endpoint) => {
            try {
                originalSocket.connect(endpoint)
                state.endpoints.add(endpoint)
                log.verbose('Socket connected to:', endpoint)
            }
            catch (err) {
                log.error('Error connecting socket to', endpoint, ':', err)

                if (state.isActive) {
                    setTimeout(() => {
                        if (state.isActive) {
                            log.info('Attempting to reconnect socket to:', endpoint)
                            wrapper.connect(endpoint)
                        }
                    }, state.reconnectDelay)
                }
            }

            return wrapper
        }

        , reconnect: () => {
            if (!state.isActive) {
                return wrapper
            }

            try {
                originalSocket.close()
            }
            catch (err) {
                log.warn('Error closing socket during reconnect:', err)
            }

            const newSocket = new SocketClass()
            Object.assign(originalSocket, newSocket)

            for (const endpoint of state.endpoints) {
                try {
                    originalSocket.connect(endpoint)
                    log.verbose('Socket reconnected to:', endpoint)
                }
                catch (err) {
                    log.error('Error reconnecting socket to', endpoint, ':', err)

                    if (state.isActive) {
                        setTimeout(() => wrapper.reconnect(), state.reconnectDelay)
                        break
                    }
                }
            }

            if (type === 'sub' || type === 'pull' || type === 'dealer' || type === 'router' || type === 'reply') {
                startReceiveLoop()
            }

            return wrapper
        }

        , subscribe: (topic) => {
            if (type === 'sub') {
                originalSocket.subscribe(
                    typeof topic === 'string' ? Buffer.from(topic) : topic
                )
            }

            return wrapper
        }

        , unsubscribe: (topic) => {
            if (type === 'sub') {
                originalSocket.unsubscribe(
                    typeof topic === 'string' ? Buffer.from(topic) : topic
                )
            }
            return wrapper
        }

        , send: (args) => {
            const sendAsync = async() => {
                try {
                    if (Array.isArray(args)) {
                        await originalSocket.send(args.map(arg =>
                            Buffer.isBuffer(arg) ? arg : Buffer.from(String(arg))
                        ))
                    }
                    else {
                        await originalSocket.send(Buffer.isBuffer(args) ? args : Buffer.from(String(args)))
                    }
                }
                catch (err) {
                    log.error('Error in send:', err && (err.message || err.toString()) || 'Unknown error')

                    if (err?.message && ['closed', 'terminating', 'ECONNREFUSED'].some((m) => err.message.includes(m))) {
                        log.warn('Socket connection appears to be closed, attempting to reconnect...')
                        wrapper.reconnect()
                    }
                }
            }

            sendAsync()

            return wrapper
        }

        , close: () => {
            state.isActive = false
            try {
                originalSocket.close()
            }
            catch (err) {
                log.warn('Error closing socket:', err)
            }
            return wrapper
        }
    }

    async function startReceiveLoop() {
        if (!state.isActive) {
            return
        }

        try {
            const iterator = originalSocket[Symbol.asyncIterator]()
            let result

            while (state.isActive && !(result = await iterator.next()).done) {
                const message = result.value

                if (Array.isArray(message) && !!message[0]?.toString) {
                    wrapper.emit(
                        'message'
                        , message[0].toString()
                        , ...message.slice(1)
                    )
                }
            }
        }
        catch (err) {
            log.error('Error in message receive loop:', err && (err.message || err.toString()) || 'Unknown error')

            if (state.isActive) {
                if (err?.message && ['closed', 'terminating', 'ECONNREFUSED'].some((m) => err.message.includes(m))) {
                    log.warn('Socket connection appears to be closed, attempting to reconnect...')
                    wrapper.reconnect()
                }
                else {
                    setTimeout(() => {
                        if (state.isActive) {
                            startReceiveLoop()
                        }
                    }, state.reconnectDelay)
                }
            }
        }
    }

    if (type === 'sub' || type === 'pull' || type === 'dealer' || type === 'router' || type === 'reply') {
        startReceiveLoop()
    }

    return wrapper
}
