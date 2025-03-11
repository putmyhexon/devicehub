import {resolve} from 'path'
import logger from '../../util/logger.js'
import childProcess from 'child_process'
import {readAll} from '../../util/streamutil.js'
import assert from 'assert'
import util from 'util'
import EventEmitter from 'events'


const log = logger.createLogger('wda')

class Mutex {
    mtx = Promise.resolve()

    /**
     *
     * @returns {Promise<function (): void>} unlock
     */
    async lock() {
        await this.mtx
        let unlock = null
        this.mtx = new Promise(resolve => {
            unlock = resolve
        })
        return unlock
    }
}

const mutex = new Mutex()


export class WDA {
    // wtf

    /**
     * @param {string | null} path wda path
     */
    constructor(path) {
        if (path) {
            this.wdaPath = path
        }
        else {
            this.wdaPath = resolve(import.meta.dirname, '../../../WebDriverAgent')
        }

        /**
         * @type {Object.<string, childProcess.ChildProcess>} amogus
         */
        this.testProcs = {}
    }

    async prepareWda() {
        const buildProc = childProcess.spawn('xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination generic/platform=iOS -allowProvisioningUpdates build', {cwd: this.wdaPath, shell: true, timeout: 10 * 60 * 1000, stdio: 'inherit'})
        assert(buildProc)
        await EventEmitter.once(buildProc, 'exit')
        if (buildProc.exitCode !== 0) {
            throw Error(`Could not build wda. Exit code is ${buildProc.exitCode}`)
        }
    }

    /**
     *
     * @param {string} udid device udid
     * @returns {Promise<void>} nothing
     */
    async startWda(udid) {
        await this.cleanup(udid)
        log.info(`Using wda path ${this.wdaPath}`)
        log.info('Building')
        const start = async() => {
            const unlock = await mutex.lock()
            try {
                let testproc = childProcess.spawn('xcodebuild', ['-project', 'WebDriverAgent.xcodeproj', '-scheme', 'WebDriverAgentRunner', '-destination', 'generic/platform=iOS', '-allowProvisioningUpdates', 'build'], {cwd: this.wdaPath, timeout: 10 * 60 * 1000, stdio: 'inherit'})
                this.testProcs[udid] = testproc
                await new Promise((resolve, reject) => { // Wait for server init
                    assert(testproc)
                    testproc.on('exit', reject)
                    testproc?.stdout?.on('data', (chunk) => {
                        const findRes = /ServerURLHere->(.*)<-ServerURLHere/g.exec(chunk)
                        if (findRes) {
                            assert(testproc)
                            testproc.removeListener('exit', reject)
                            resolve(findRes[0])
                        }
                    })
                    testproc?.stdout?.pipe(process.stdout)
                    testproc?.stderr?.pipe(process.stderr)
                })
                testproc.on('exit', async() => {
                    await this.cleanup(udid)
                    log.error(`WDA process for ${udid} exited`)
                })
            }
            finally {
                await unlock()
            }
        }
        try {
            await start()
        }
        catch (e) {
            await this.cleanup(udid)
            throw e
        }
    }

    /**
     * @param {string} udid device udid
     * @returns {Promise<void>} nothing
     */
    async cleanup(udid) {
        const killProc = async(/** @type {childProcess.ChildProcess | null} */ proc) => {
            if (proc !== null) {
                proc.kill(9)
                if (proc.exitCode === null) {
                    await EventEmitter.once(proc, 'exit')
                }
            }
        }
        const proc = this.testProcs[udid]
        delete this.testProcs[udid]
        if (proc) {
            await killProc(proc)
        }
    }
}

