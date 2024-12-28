import { makeAutoObservable } from 'mobx'

import { groupService } from '@/services/group-service'
import { settingsService } from '@/services/settings-service'
import { serviceLocator } from '@/services/service-locator'
import { TouchService } from '@/services/touch-service/touch-service'
import { KeyboardService } from '@/services/keyboard-service/keyboard-service'
import { BookingService } from '@/services/booking-service'
import { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

import { deviceListStore } from './device-list-store'
import { deviceBySerialStore } from './device-by-serial-store'
import { DeviceControlStore } from './device-control-store'
import { DeviceScreenStore } from './device-screen-store/device-screen-store'

class DeviceConnection {
  constructor() {
    makeAutoObservable(this)
  }

  async useDevice(serial: string): Promise<void> {
    const device = await deviceBySerialStore.fetch(serial)

    if (!device?.channel) return

    try {
      const deviceControlStore = new DeviceControlStore(device.channel, !!device.ios)
      serviceLocator.register(DeviceControlStore.name, deviceControlStore)

      const connectToDevice = await Promise.all([
        deviceControlStore.startRemoteConnect().promise,
        groupService.invite(device),
      ])

      console.info(`adb connect ${connectToDevice[0]}`)

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

  stopUsingDevice(serial: string): Promise<unknown> | undefined {
    const device = deviceListStore.deviceBySerial(serial)

    if (!device) return undefined

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
