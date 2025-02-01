import stream from 'stream'
import url from 'url'
import {v4 as uuidv4} from 'uuid'
import syrup from '@devicefarmer/stf-syrup'
import request from 'postman-request'
import logger from '../../../util/logger.js'
import wire from '../../../wire/index.js'
import wireutil from '../../../wire/util.js'
import Promise from 'bluebird'
import {mkdir as mkdir$0, unlinkSync, createWriteStream} from 'fs'
import http from 'http'
import https from 'https'
import {exec as exec$0} from 'child_process'
import * as promiseutil from '../../../util/promiseutil.js'
import router from '../../base-device/support/router.js'
import push from '../../base-device/support/push.js'

const mkdir = Promise.promisify({mkdir: mkdir$0}.mkdir)
const exec = {exec: exec$0}.exec
function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            resolve(stdout)
        })
    })
}
const installApp = (udid, filepath, id) => {
    let commands = [
        `idb install ${filepath}/${id} --udid=${udid}`
    ]
    return new Promise((resolve, reject) => {
        execShellCommand(commands.join(';')).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}

const launchApp = (udid, bundleId) => {
    let commands = [
        `idb launch ${bundleId} --udid=${udid}`
    ]
    return new Promise((resolve, reject) => {
        execShellCommand(commands.join(';')).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}

const uninstallApp = (udid, bundleId) => {
    let commands = [
        `idb uninstall ${bundleId} --udid=${udid}`
    ]
    return new Promise((resolve, reject) => {
        execShellCommand(commands.join(';')).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}
export default syrup.serial()
    .dependency(router)
    .dependency(push)
    .define(function(options, router, push) {
        const log = logger.createLogger('device:plugins:install')
        router.on(wire.InstallMessage, function(channel, message) {
            log.info('Installing application from "%s"', message.href)
            const reply = wireutil.reply(options.serial)

            function sendProgress(data, progress) {
                push.send([channel, reply.progress(data, progress)])
            }

            sendProgress('starting', 0)

            const req = request({url: url.resolve(options.storageUrl, message.href)})
            const reqInfo = new stream.Readable().wrap(req)
            log.info('reqInfo: ' + JSON.stringify(reqInfo))

            const id = uuidv4()
            const tmpDirPath = `/tmp/${id}`
            const filePath = `${tmpDirPath}/${id}.ipa`

            log.info('mkdir "%s"', tmpDirPath)

            mkdir(tmpDirPath)
                .then(() => {
                    const file = createWriteStream(filePath)
                    const httpServer = options.storageUrl.includes('https://') ? https : http

                    log.info('url: ', options.storageUrl.replace(/\/+$/, '') + message.href)

                    httpServer.get(options.storageUrl.replace(/\/+$/, '') + message.href, function(response) {
                        response.pipe(file)
                        const totalSize = response.headers['content-length']
                        let downloadedSize = 0

                        response.on('data', (chunk) => {
                            downloadedSize += chunk.length
                            const progress = Math.round((downloadedSize / totalSize) * 10 + 50)
                            sendProgress('pushing_app', progress)
                        })

                        file.on('finish', () => {
                            file.close()
                            log.info('Download Completed')
                            let guesstimate = 60

                            sendProgress('installing_app', guesstimate)

                            promiseutil.periodicNotify(installApp(options.serial, tmpDirPath, id), 250)
                                .progressed(() => {
                                    guesstimate = Math.min(95, guesstimate + 1.5 * (95 - guesstimate) / 35)
                                    sendProgress('installing_app', guesstimate)
                                })
                                .then((result) => {
                                    push.send([channel, reply.okay('INSTALL_SUCCEEDED')])
                                    if (message.launch) {
                                        let bundleId = result.match(/.[\w.-]+[\w-]/)
                                        sendProgress('launching_app', 100)
                                        launchApp(options.serial, bundleId)
                                    }
                                })
                                .catch((err) => {
                                    let errorReply = 'INSTALL_ERROR_UNKNOWN'
                                    log.error('Installation of package failed', err.stack)
                                    if (err.stack.includes('ApplicationVerificationFailed')) {
                                        errorReply = 'INSTALL_ERROR_APP_SIGNING'
                                    }
                                    if (err.stack.includes('not in the bundles supported architectures')) {
                                        errorReply = 'INSTALL_ERROR_APP_ARCHITECTURE'
                                    }
                                    push.send([channel, reply.fail(errorReply)])
                                })

                            unlinkSync(filePath)
                        })
                    })
                })
                .catch(err => log.fatal('Unable to create temp dir', err))
        })
        router.on(wire.UninstallIosMessage, function(channel, message) {
            uninstallApp(options.serial, message.packageName)
        })
    })
