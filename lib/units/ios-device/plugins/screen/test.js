const initSerial = require('./atmega')
let curAngle = 0
const angularSpeed = 15
const size = 100
let cx = 0
let cy = 0

initSerial('/dev/tty.usbmodem2101').then(({sendCommand}) => {
  const next = () => {
    curAngle = (curAngle + angularSpeed) % 360
    const x = Math.sin(curAngle / 180 * Math.PI) * size
    const y = Math.cos(curAngle / 180 * Math.PI) * size
    console.log(curAngle, x, y, cx, cy, x - cx, y - cy)
    sendCommand(x - cx, y - cy)
    cx = x
    cy = y
  }
  setInterval(next, 250)
  // sendCommand(100, 0)
}).catch(console.error)
