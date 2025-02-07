import syrup from '@devicefarmer/stf-syrup'
import wire from '../../../wire/index.js'
import wireutil from '../../../wire/util.js'
import {spawn} from 'child_process'
import Promise from 'bluebird'
import * as dbapi from '../../../db/api.js'
import logger from '../../../util/logger.js'
import push from '../../base-device/support/push.js'
import router from '../../base-device/support/router.js'
import sub from '../../base-device/support/sub.js'
import group from './group.js'
import {IncompleteJsonParser} from 'incomplete-json-parser'

export default syrup.serial()
    .dependency(push)
    .dependency(router)
    .dependency(sub)
    .dependency(group)
    .define(function(options, push, router, sub, group) {
        const log = logger.createLogger('device:plugins:devicelog')

        let DeviceLogger = {
            appOptions: {}
            , channel: ''
            , stream: null

            , setChannel: channel => {
                DeviceLogger.channel = channel
            }

            , startLogging: async function(channel) {
                DeviceLogger.setChannel(channel)
                try {
                    const realGroup = await group.get()
                    const parser = new IncompleteJsonParser()

                    DeviceLogger.stream = spawn('idb', ['log', '--udid', options.serial, '--', '--style', 'json'])

                    DeviceLogger.stream.stdout.on('data', data => {
                        parser.write(data.toString())
                        let logs = parser.getObjects()
                        let threadId = 0
                        let processId = 0
                        let subsystem = '*'
                        let message
                        logs.forEach(log => {
                            let logLevel = 2
                            switch (log.messageType) {
                            case 'Fatal': { logLevel = 7; break }
                            case 'Error': { logLevel = 6; break }
                            case 'Warning': { logLevel = 5; break }
                            case 'Default': { logLevel = 4; break }
                            case 'Activity': { logLevel = 3; break }
                            }

                            if (log.eventMessage) {
                                message = log.eventMessage
                            }
                            else if (log.formatString) {
                                message = log.formatString
                            }
                            else {
                                return
                            }

                            if (log.threadID) {
                                threadId = log.threadID
                            }

                            if (log.processID) {
                                processId = log.processID
                            }

                            if (log.subsystem) {
                                subsystem = log.subsystem
                            }
                            else {
                                subsystem = '*'
                            }

                            push.send([
                                realGroup.group
                                , wireutil.envelope(new wire.DeviceLogcatEntryMessage(
                                    options.serial
                                    , new Date().getTime() / 1000
                                    , processId
                                    , threadId
                                    , logLevel
                                    , subsystem
                                    , message
                                ))
                            ])
                        })
                    })

                    DeviceLogger.stream.stderr.on('data', data => {
                        console.log(data.toString())
                    })

                    DeviceLogger.stream.on('close', err => {
                        log.warn('Stream is closed', err)
                        DeviceLogger.killLoggingProcess()
                    })
                }
                catch (error) {
                    log.error('Error starting logging', error)
                }
            }

            , killLoggingProcess: () => {
                if (DeviceLogger.stream) {
                    DeviceLogger.stream.kill()
                    DeviceLogger.stream = null
                    DeviceLogger.channel = ''
                }
            }
        }

        group.on('leave', DeviceLogger.killLoggingProcess)

        router
            .on(wire.LogcatStartMessage, async function(channel, message) {
                const reply = wireutil.reply(options.serial)
                try {
                    await dbapi.loadDeviceBySerial(options.serial)
                    DeviceLogger.startLogging(channel)
                    push.send([channel, reply.okay('success')])
                }
                catch (error) {
                    log.error('Error loading device', error)
                    DeviceLogger.killLoggingProcess()
                }
            })
            .on(wire.LogcatStopMessage, function(channel, data) {
                const reply = wireutil.reply(options.serial)
                DeviceLogger.killLoggingProcess()
                push.send([channel, reply.okay('success')])
            })
            .on(wire.GroupMessage, function(channel, data) {
                DeviceLogger.channel = channel
            })

        return Promise.resolve()
    })
