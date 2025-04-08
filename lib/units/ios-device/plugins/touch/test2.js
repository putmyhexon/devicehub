import {Esp32Touch} from './esp32touch.js'

const sleep = (number) => new Promise((resolve) => setTimeout(resolve, number))

const main = async() => {
    // const ports = await Esp32Touch.listPorts()
    // console.log(ports)
    // const dev = new Esp32Touch(1170, 2532, '/dev/tty.usbserial-110')
    const dev = new Esp32Touch(1170, 2532, '/dev/cu.usbmodem1101')
    // dev.setName('1222')
    // return
    dev.move(0.5, 0.5)
    await sleep(2000)
    while(true) {
        dev.move(0.25, 0.25)
        await sleep(2000)
        dev.move(0.75, 0.25)
        await sleep(2000)
        dev.move(0.75, 0.75)
        await sleep(2000)
        dev.move(0.25, 0.75)
        await sleep(2000)
        dev.move(0.5, 0.5)
        await sleep(2000)
    }
}

main()
