const {SerialPort} = require('serialport')
const logger = require('../../../../util/logger')
const Promise = require('bluebird')

module.exports = initSerial

function initSerial(serialPort) {
  const serial = new SerialPort({
    path: serialPort
    , baudRate: 115200
    , autoOpen: false
  })
  return new Promise((resolve, reject) => {
    serial.open((err) => {
      if (err !== null) {
        reject(err)
        return
      }
      const sendCommand = (dx, dy) => {
        return new Promise((resolve) => {
          const commandBuffer = new Int8Array([dx, dy])
          let chunk = Buffer.from(commandBuffer.buffer)
          console.log('sending', chunk)
          serial.write(chunk, (e) => {
            if (e !== null) {
              reject(e)
            }
            resolve()
          })
          serial.flush()
        })
      }
      serial.on('open', () => {
        serial.on('data', (data) => {
          console.log(data)
          console.log(data.toString())
        })
      })
      resolve({sendCommand})
    })
  })
}
