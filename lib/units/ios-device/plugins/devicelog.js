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

export default syrup
    .serial()
    .dependency(push)
    .dependency(router)
    .dependency(sub)
    .dependency(group)
    .define(function(options, push, router, group) {
        const log = logger.createLogger('device:plugins:devicelog')

        let DeviceLogger = {
            appOptions: {}
            , channel: ''
            , stream: null

            , setChannel: channel => {
                DeviceLogger.channel = channel
            }

            , startLoggging: async function(channel) {
                DeviceLogger.setChannel(channel)
                try {
                    DeviceLogger.stream = spawn('idb logs --udid ' + options.serial, {shell: true})

                    DeviceLogger.stream.stdout.on('data', data => {
                        push.send([
                            this.channel
                            , wireutil.envelope(new wire.DeviceLogcatEntryMessage(options.serial, new Date().getTime() / 1000, DeviceLogger.stream.pid, DeviceLogger.stream.pid, 1, 'device:log:cat', data.toString()))
                        ])
                    })

                    DeviceLogger.stream.on('close', err => {
                        log.fatal('Unable to get devicelog', err)
                        DeviceLogger.killLoggingProcess()
                    })
                }
                catch (error) {
                    log.error('Error starting logging', error)
                }
            }

            , killLoggingProcess: () => {
                if (DeviceLogger.stream) {
                    process.kill(-DeviceLogger.stream.pid)
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
                    DeviceLogger.startLoggging(channel)
                    push.send([channel, reply.okay('success')])
                }
                catch (error) {
                    log.error('Error loading device', error)
                    DeviceLogger.killLoggingProcess()
                }
            })
            .on(wire.LogcatStopMessage, function(channel, data) {
                DeviceLogger.killLoggingProcess()
            })
            .on(wire.GroupMessage, function(channel, data) {
                DeviceLogger.channel = channel
            })

        return Promise.resolve()
    })
