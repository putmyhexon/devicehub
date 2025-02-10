import syrup from '@devicefarmer/stf-syrup'
import logger from '../../../util/logger.js'
import wire from '../../../wire/index.js'
import wireutil from '../../../wire/util.js'
import router from '../../base-device/support/router.js'
import push from '../../base-device/support/push.js'
import storage from '../support/storage.js'
import {exec} from 'child_process'
import path from 'path'
import fs from 'fs'
export default syrup.serial()
    .dependency(router)
    .dependency(push)
    .dependency(storage)
    .define(function(options, router, push, storage) {
        var log = logger.createLogger('device:plugins:filesystem')
        var plugin = Object.create(null)

        const getRootDir = dir => {
            let currentPath = dir.split('/')
            let rootDir = currentPath[1]
            let target = 'media'
            switch (rootDir) {
            case 'root': {
                // only for simulators
                return 'root'
            }
            case 'application': {
                return 'application'
            }
            case 'crashes': {
                return 'crashes'
            }
            }
            return target
        }

        router.on(wire.FileSystemGetMessage, function(channel, message) {
            let reply = wireutil.reply(options.serial)
            let file = message.file
            log.info('Retrieving file "%s"', file)
            let currentPath = file.split('/')
            let target = getRootDir(file)

            if (currentPath.length === 2) {
                currentPath = ''
            }
            else {
                currentPath = currentPath.slice(2).join('/').replace(' ', '\\ ')
            }

            exec(
                `idb file pull --${target} ./${currentPath} /tmp/tmp123 --json --udid ${options.serial}`,
                (error, stdout, stderr) => {
                    if (error) {
                        log.warn('Unable to list directory "%s"', file, stderr)
                    }

                    storage.store('blob', path.basename(file), {
                        filename: path.basename(file)
                        , contentType: 'application/octet-stream'
                    }).then((file) => {
                        try {
                            push.send([
                                channel
                                , reply.okay('success', file)
                            ])
                        }
                        catch (e) {
                            push.send([
                                channel
                                , reply.fail('error', e)
                            ])
                        }
                        fs.unlink('/tmp/tmp123', (err) => {
                            log.warn('Error while deleting file "%s"', file, err)
                        })
                    })
                }
            )
        })
        router.on(wire.FileSystemListMessage, function(channel, message) {
            let reply = wireutil.reply(options.serial)
            let dirs = []
            let rootDir = message.dir
            if (rootDir === '/') {
                dirs = [
                    {name: 'root', mtime: '1970-01-01T00:00:00.000Z', atime: null, ctime: null, birthtime: null, mode: 16877, size: 0}
                    , {name: 'application', mtime: '1970-01-01T00:00:00.000Z', atime: null, ctime: null, birthtime: null, mode: 16877, size: 0}
                    , {name: 'crashes', mtime: '1970-01-01T00:00:00.000Z', atime: null, ctime: null, birthtime: null, mode: 16877, size: 0}
                    , {name: 'media', mtime: '1970-01-01T00:00:00.000Z', atime: null, ctime: null, birthtime: null, mode: 16877, size: 0}
                ]
                push.send([
                    channel
                    , reply.okay('success', dirs)
                ])
            }
            let currentPath = message.dir.split('/')
            let target = getRootDir(message.dir)

            if (currentPath.length === 2) {
                currentPath = ''
            }
            else {
                currentPath = currentPath.slice(2).join('/').replace(' ', '\\ ')
            }

            exec(
                `idb file list --${target} ./${currentPath} --json --udid ${options.serial}`,
                (error, stdout, stderr) => {
                    if (error) {
                        log.warn('Unable to list directory "%s"', message.dir, stderr)
                        push.send([
                            channel
                            , reply.fail(error.message)
                        ])
                        return
                    }

                    let rawDirs = JSON.parse(stdout)
                    let dirs = []
                    rawDirs.forEach(dir => {
                        let name = dir.path
                        let mode = 16629
                        if (name.includes('.')) {
                            mode = 0o555
                        }
                        dirs.push({
                            name: name, mtime: '1970-01-01T00:00:00.000Z', atime: null, ctime: null, birthtime: null, mode: mode, size: 0
                        })
                    })

                    push.send([
                        channel
                        , reply.okay('success', dirs)
                    ])
                }
            )
        })
        return plugin
    })
