import { makeAutoObservable } from 'mobx'

import { controlService } from '@/services/core/control-service'

import { deviceListStore } from './device-list-store'

import type { EffectiveConnectionType } from '@/vite-env'

class DeviceControlStore {
  private currentNetworkType: EffectiveConnectionType = '3g'

  currentQuality = 20

  constructor() {
    makeAutoObservable(this)
  }

  setCurrentQuality(quality: number): void {
    this.currentQuality = quality
  }

  tryToRotate(serial: string, rotation: 'portrait' | 'landscape'): void {
    const device = deviceListStore.deviceBySerial(serial)

    if (!device) return

    if (rotation === 'portrait') {
      controlService.rotate(device, 0)

      setTimeout(() => {
        if (device.serial && this.isLandscape(device.serial)) {
          console.info('tryToRotate but it still landscape')
        }
      }, 400)
    }

    if (rotation === 'landscape') {
      controlService.rotate(device, 90)

      setTimeout(() => {
        if (device.serial && this.isPortrait(device.serial)) {
          console.info('tryToRotate but it still portrait')
        }
      }, 400)
    }
  }

  rotateLeft(serial: string): void {
    const device = deviceListStore.deviceBySerial(serial)

    if (!device?.display?.rotation) return

    if (device.display.rotation === 0) {
      controlService.rotate(device, 270)

      return
    }

    controlService.rotate(device, device.display.rotation - 90)
  }

  rotateRight(serial: string): void {
    const device = deviceListStore.deviceBySerial(serial)

    if (!device?.display?.rotation) return

    if (device.display.rotation === 270) {
      controlService.rotate(device, 0)

      return
    }

    controlService.rotate(device, device.display.rotation + 90)
  }

  changeDeviceQuality(serial: string, quality: number): void {
    const device = deviceListStore.deviceBySerial(serial)

    if (!device) return

    controlService.changeQuality(device, quality)

    this.setCurrentQuality(quality)
  }

  autoQuality(serial: string): void {
    // NOTE: Limited browser availability
    const networkType = navigator.connection?.effectiveType || '4g'

    if (this.currentNetworkType === networkType) return

    this.currentNetworkType = networkType

    const device = deviceListStore.deviceBySerial(serial)

    if (!device) return

    switch (this.currentNetworkType) {
      case 'slow-2g': {
        controlService.changeQuality(device, 10)
        this.setCurrentQuality(10)
        break
      }

      case '2g': {
        controlService.changeQuality(device, 20)
        this.setCurrentQuality(20)
        break
      }

      case '3g': {
        controlService.changeQuality(device, 60)
        this.setCurrentQuality(60)
        break
      }

      case '4g': {
        controlService.changeQuality(device, 80)
        this.setCurrentQuality(80)
        break
      }

      default: {
        controlService.changeQuality(device, 80)
        this.setCurrentQuality(80)
      }
    }
  }

  private isPortrait(serial: string): boolean {
    const device = deviceListStore.deviceBySerial(serial)

    return device?.display?.rotation === 0 || device?.display?.rotation === 180
  }

  private isLandscape(serial: string): boolean {
    const device = deviceListStore.deviceBySerial(serial)

    return device?.display?.rotation === 90 || device?.display?.rotation === 270
  }
}

export const deviceControlStore = new DeviceControlStore()
