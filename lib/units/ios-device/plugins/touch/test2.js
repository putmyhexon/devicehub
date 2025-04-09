import {promisify} from 'node:util'
import {Esp32Touch} from './esp32touch.js'
import {once} from 'node:events'

const sleep = (number) => new Promise((resolve) => setTimeout(resolve, number))

const main = async() => {
    // const ports = await Esp32Touch.listPorts()
    // console.log(ports)
    // const dev = new Esp32Touch(1170, 2532, '/dev/tty.usbserial-110')
    const dev = new Esp32Touch(390, 844, '/dev/cu.usbmodem11101')
    await once(dev, 'rebooted')
    dev.setName('23232')
    await once(dev, 'paired')
    // dev.setName('1222')
    // return
    dev.move(0.5, 0.5)
    while(true) {
        dev.move(0.25, 0.25)
        await sleep(1000)
        dev.move(0.75, 0.25)
        await sleep(1000)
        dev.move(0.75, 0.75)
        await sleep(1000)
        dev.move(0.25, 0.75)
        await sleep(1000)
        dev.move(0.5, 0.5)
        await sleep(1000)
    }
}

main()
