const Promise = require('bluebird')
const EventEmitter = require('events')
const path = require('path')
const net = require('net')
const {PromiseSocket} = require('promise-socket')
const syrup = require('@devicefarmer/stf-syrup')
const logger = require('../../../util/logger')

/**
 * How scrcpy works?
 *
 * Its a jar file that runs on an adb shell. It records the screen in h264 and offers it in a given tcp port.
 *
 * scrcpy params
 *   maxSize         (integer, multiple of 8) 0
 *   bitRate         (integer)
 *   tunnelForward   (optional, bool) use "adb forward" instead of "adb tunnel"
 *   crop            (optional, string) "width:height:x:y"
 *   sendFrameMeta   (optional, bool)
 *
 * The video stream contains raw packets, without time information. If sendFrameMeta is enabled a meta header is added
 * before each packet.
 * The "meta" header length is 12 bytes
 * [. . . . . . . .|. . . .]. . . . . . . . . . . . . . . ...
 *  <-------------> <-----> <-----------------------------...
 *        PTS         size      raw packet (of size len)
 *
 */


module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../support/properties'))
  .dependency(require('../support/abi'))
  .dependency(require('../support/sdk'))
  .define(function(options, adb, properties, abi, sdk) {
    let log = logger.createLogger('device:resources:scrcpy')

    class Scrcpy extends EventEmitter {
      constructor(config) {
        super()
        this._config = Object.assign({
          deviceId: options.serial
          , port: 8099
          , maxSize: 600
          , bitrate: 999999999
          , tunnelForward: true
          , tunnelDelay: 3000
          , crop: '9999:9999:0:0'
          , sendFrameMeta: false
        }, config)

        this.adbClient = adb
      }

      /**
       * Will connect to the android device, send & run the server and return deviceName, width and height.
       * After that data will be offered as a 'data' event.
       */
      async start() {
        // Transfer server...
        await this.adbClient.getDevice(options.serial).push(path.join(__dirname, 'scrcpy-server.jar'), '/data/local/tmp/scrcpy-server.jar')
          .then(transfer => new Promise(((resolve, reject) => {
            transfer.on('progress', (stats) => {
              console.log('[%s] Pushed %d bytes so far',
                options.serial,
                stats.bytesTransferred)
            })
            transfer.on('end', () => {
              console.log('[%s] Push complete', options.serial)
              resolve()
            })
            transfer.on('error', reject)
          })))
          .catch(e => {
            console.log('Impossible to transfer server file:', e)
            throw e
          })

        // Run server
        await this.adbClient.getDevice(options.serial).shell('CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / ' +
          `com.genymobile.scrcpy.Server ${this._config.maxSize} ${this._config.bitrate} ${this._config.tunnelForward} ` +
          `${this._config.crop} false`)
          .catch(e => {
            console.log('Impossible to run server:', e)
            throw e
          })
        console.log('Started server')

        await this.adbClient.getDevice(options.serial).forward(`tcp:${this._config.port}`, 'localabstract:scrcpy')
          .catch(e => {
            console.log(`Impossible to forward port ${this._config.port}:`, e)
            throw e
          })
        console.log('Forwarded port')

        this.socket = new PromiseSocket(new net.Socket())

        // Wait 1 sec to forward to work
        await Promise.delay(this._config.tunnelDelay)
        console.log('Started working, subscribing to data')


        console.log('raw')
        this._startStreamRaw()

        // Connect
        await this.socket.connect(this._config.port, '127.0.0.1')
          .catch(e => {
            console.log(`Impossible to connect "127.0.0.1:${this._config.port}":`, e)
            throw e
          })
        console.log('Connected')


        // First chunk is 69 bytes length -> 1 dummy byte, 64 bytes for deviceName, 2 bytes for width & 2 bytes for height
        const firstChunk = await this.socket.read(69)
          .catch(e => {
            console.log('Impossible to read first chunk:', e)
            throw e
          })
        console.log('Got first chunk')

        const name = firstChunk.slice(1, 65).toString('utf8')
        const width = firstChunk.readUInt16BE(65)
        const height = firstChunk.readUInt16BE(67)
        console.log(`${name}: ${width} x ${height}`)

        return {name, width, height}
      }

      stop() {
        if (this.socket) {
          this.socket.destroy()
        }
      }

      _startStreamRaw() {
        // console.log(this.socket.stream.)
        this.socket.stream.on('data', d => {
          console.log(d)
          this.emit('rawData', d)
        })
      }
    }

    return {
      Scrcpy
    }
  })

