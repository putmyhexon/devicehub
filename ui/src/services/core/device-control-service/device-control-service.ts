import { socket } from '@/api/socket'
import { TransactionService } from '@/services/core/transaction-service/transaction-service'

import { KEYBOARD_KEYS_MAP } from '@/constants/keyboard-keys-map'

import type { TouchDownArgs, TouchMoveArgs, TouchMoveIosArgs } from './types'

export class DeviceControlService {
  constructor(
    private deviceChannel: string,
    private isDeviceIos: boolean
  ) {}

  gestureStart(seq: number): void {
    this.sendOneWay('input.gestureStart', {
      seq,
    })
  }

  gestureStop(seq: number): void {
    this.sendOneWay('input.gestureStop', {
      seq,
    })
  }

  touchDown({ seq, contact, x, y, pressure }: TouchDownArgs): void {
    this.sendOneWay('input.touchDown', {
      seq,
      contact,
      x,
      y,
      pressure,
    })
  }

  tapDeviceTreeElement(label: string): void {
    this.sendOneWay('tapDeviceTreeElement', {
      label,
    })
  }

  // NOTE: I have no idea where this method used
  touchMoveIos({ x, y, pX, pY, pressure, contact, seq }: TouchMoveIosArgs): void {
    this.sendOneWay('input.touchMoveIos', {
      seq,
      contact,
      toX: x,
      toY: y,
      fromX: pX,
      fromY: pY,
      pressure,
    })
  }

  touchMove({ seq, contact, x, y, pressure }: TouchMoveArgs): void {
    this.sendOneWay('input.touchMove', {
      seq,
      contact,
      x,
      y,
      pressure,
    })
  }

  touchUp(seq: number, contact: number): void {
    this.sendOneWay('input.touchUp', {
      seq,
      contact,
    })
  }

  touchCommit(seq: number): void {
    this.sendOneWay('input.touchCommit', {
      seq,
    })
  }

  touchReset(seq: number): void {
    this.sendOneWay('input.touchReset', {
      seq,
    })
  }

  type(text: string): void {
    this.sendOneWay('input.type', {
      text,
    })
  }

  paste(text: string): void {
    this.sendTwoWay('clipboard.paste', {
      text,
    })
  }

  copy(): Promise<unknown> {
    return this.sendTwoWay('clipboard.copy')
  }

  keyDown(key: string): void {
    return this.keySender('input.keyDown', key)
  }

  keyUp(key: string): void {
    return this.keySender('input.keyUp', key)
  }

  changeQuality(quality: number): void {
    return this.sendOneWay('quality.change', {
      quality,
    })
  }

  rotate(rotation: number, lock?: boolean): void {
    return this.sendOneWay('display.rotate', {
      rotation,
      lock,
    })
  }

  startRemoteConnect(): Promise<unknown> {
    return this.sendTwoWay('connect.start')
  }

  home = this.keyPress('home')
  menu = this.keyPress('menu')
  back = this.keyPress('back')
  appSwitch = this.keyPress('app_switch')
  switchCharset = this.keyPress('switch_charset')

  private sendOneWay<T>(action: string, data?: T): void {
    socket.emit(action, this.deviceChannel, data)
  }

  private sendTwoWay<T>(action: string, data?: T): Promise<unknown> {
    const transaction = new TransactionService()
    const { channel: transactionChannel, promise: transactionEndPromise } = transaction.initializeTransaction()

    const platformSpecificAction = this.isDeviceIos ? `${action}Ios` : action

    socket.emit(platformSpecificAction, this.deviceChannel, transactionChannel, data)

    return transactionEndPromise
  }

  private keySender(type: string, key: string): void {
    if (KEYBOARD_KEYS_MAP[key]) {
      this.sendOneWay(type, {
        key: KEYBOARD_KEYS_MAP[key],
      })
    }
  }

  private keyPress(key: string): () => void {
    return () => {
      this.sendOneWay('input.keyPress', {
        key,
      })
    }
  }
}
