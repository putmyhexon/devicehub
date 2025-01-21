import { socket } from '@/api/socket'

import { KEYBOARD_KEYS_MAP } from '@/constants/keyboard-keys-map'

import type { TransactionService } from '@/services/core/transaction-service/transaction-service'
import type { DeviceBySerialStore } from '@/store/device-by-serial-store'
import type { TouchDownArgs, TouchMoveArgs, TouchMoveIosArgs } from './types'
import type { InitializeTransactionReturn, InstallOptions } from '@/services/core/transaction-service/types'

export class DeviceControlService {
  constructor(
    protected deviceBySerialStore: DeviceBySerialStore,
    private transactionServiceFactory: () => TransactionService
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

  copy(): InitializeTransactionReturn {
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

  install(options: InstallOptions): InitializeTransactionReturn {
    return this.sendTwoWay('device.install', options)
  }

  installIos(options: InstallOptions): InitializeTransactionReturn {
    return this.sendTwoWay('deviceIos.install', options)
  }

  uninstall(packageName: string): InitializeTransactionReturn {
    return this.sendTwoWay('device.uninstall', {
      packageName,
    })
  }

  reboot(): InitializeTransactionReturn {
    return this.sendTwoWay('device.reboot')
  }

  startRemoteConnect(): InitializeTransactionReturn {
    return this.sendTwoWay('connect.start')
  }

  home = this.keyPress('home')
  menu = this.keyPress('menu')
  back = this.keyPress('back')
  appSwitch = this.keyPress('app_switch')
  switchCharset = this.keyPress('switch_charset')
  power = this.keyPress('power')
  camera = this.keyPress('camera')
  search = this.keyPress('search')
  mute = this.keyPress('mute')
  volumeDown = this.keyPress('volume_down')
  volumeUp = this.keyPress('volume_up')
  mediaRewind = this.keyPress('media_rewind')
  mediaPrevious = this.keyPress('media_previous')
  mediaPlayPause = this.keyPress('media_play_pause')
  mediaStop = this.keyPress('media_stop')
  mediaNext = this.keyPress('media_next')
  mediaFastForward = this.keyPress('media_fast_forward')

  async unlockDevice(): Promise<void> {
    await this.shell('input text 1452').promise
    await this.shell('input keyevent 66').promise
  }

  setLightTheme(): void {
    this.shell('cmd uimode night no')
  }

  setDarkTheme(): void {
    this.shell('cmd uimode night yes')
  }

  enableDKA(): void {
    this.shell('settings put global always_finish_activities 1')
  }

  disableDKA(): void {
    this.shell('settings put global always_finish_activities 0')
  }

  enableGoogleServices(): void {
    this.shell('pm enable com.google.android.gms')
    this.shell('pm enable-user com.google.android.gms')
  }

  disableGoogleServices(): void {
    this.shell('pm disable-user com.google.android.gms')
  }

  openLanguageChange(): void {
    this.shell('am start -a android.settings.LOCALE_SETTINGS')
  }

  fontChange(value: number): void {
    this.shell(`settings put system font_scale ${value}`)
  }

  openBrowser(url: string, browserId?: string): InitializeTransactionReturn {
    return this.sendTwoWay('browser.open', {
      url,
      browser: browserId || null,
    })
  }

  clearBrowser(browserId?: string): InitializeTransactionReturn {
    return this.sendTwoWay('browser.clear', {
      browser: browserId || null,
    })
  }

  shell(command: string): InitializeTransactionReturn {
    return this.sendTwoWay('shell.command', {
      command,
      timeout: 10000,
    })
  }

  private sendOneWay<T>(action: string, data?: T): void {
    const { data: device } = this.deviceBySerialStore.deviceQueryResult()

    socket.emit(action, device?.channel, data)
  }

  private sendTwoWay<T>(action: string, data?: T): InitializeTransactionReturn {
    const transaction = this.transactionServiceFactory()
    const initializeTransaction = transaction.initializeTransaction()

    const { data: device } = this.deviceBySerialStore.deviceQueryResult()

    const platformSpecificAction = device?.ios ? `${action}Ios` : action

    socket.emit(platformSpecificAction, device?.channel, initializeTransaction.channel, data)

    return initializeTransaction
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
