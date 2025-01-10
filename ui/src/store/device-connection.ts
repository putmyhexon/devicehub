import { makeAutoObservable } from 'mobx'

import { groupService } from '@/services/group-service'
import { settingsService } from '@/services/settings-service'
import { serviceLocator } from '@/services/service-locator'
import { TouchService } from '@/services/touch-service/touch-service'
import { KeyboardService } from '@/services/keyboard-service/keyboard-service'
import { BookingService } from '@/services/booking-service'
import { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

import { deviceBySerialStore } from './device-by-serial-store'
import { DeviceControlStore } from './device-control-store'
import { DeviceScreenStore } from './device-screen-store/device-screen-store'

class DeviceConnection {
  debugCommand: string = ''

  constructor() {
    makeAutoObservable(this)
  }

  async useDevice(serial: string): Promise<void> {
    const device = await deviceBySerialStore.fetch(serial)

    if (!device?.channel) return

    try {
      const deviceControlStore = new DeviceControlStore(device.channel, !!device.ios)
      serviceLocator.register(DeviceControlStore.name, deviceControlStore)

      deviceControlStore.startRemoteConnect().promise.then((connectToDeviceData) => {
        const debugCommand = `adb connect ${connectToDeviceData}`

        this.debugCommand = debugCommand

        console.info(debugCommand)
      })

      await groupService.invite(device)

      serviceLocator.register(DeviceScreenStore.name, new DeviceScreenStore())
      serviceLocator.register(BookingService.name, new BookingService(serial))
      serviceLocator.register(ApplicationInstallationService.name, new ApplicationInstallationService(serial))
      serviceLocator.register(KeyboardService.name, new KeyboardService())
      serviceLocator.register(TouchService.name, new TouchService())

      settingsService.setLastUsedDevice(serial)
    } catch (error) {
      // TODO: Обработать ошибку, показать toast
      console.error(error)
    }
  }

  async stopUsingDevice(serial: string): Promise<unknown> {
    const device = await deviceBySerialStore.fetch(serial)

    serviceLocator.unregister(DeviceControlStore.name)
    serviceLocator.unregister(BookingService.name)
    serviceLocator.unregister(ApplicationInstallationService.name)
    serviceLocator.unregister(DeviceScreenStore.name)
    serviceLocator.unregister(KeyboardService.name)
    serviceLocator.unregister(TouchService.name)

    return groupService.kick(device)
  }
}

export const deviceConnection = new DeviceConnection()
