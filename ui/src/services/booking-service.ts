import { makeAutoObservable } from 'mobx'

import { deviceBySerialStore } from '@/store/device-by-serial-store'

import { groupService } from './group-service'

export class BookingService {
  bookedBeforeTime: string | undefined

  constructor(serial: string) {
    makeAutoObservable(this)

    this.init(serial)
  }

  async init(serial: string): Promise<void> {
    const device = await deviceBySerialStore.fetch(serial)

    if (device?.statusChangedAt) {
      this.setTime(device.statusChangedAt, device?.bookedBefore || 0)
    }
  }

  async reBookDevice(): Promise<void> {
    const { data: device } = await deviceBySerialStore.refetch()

    if (!device) return

    await groupService.invite(device)

    if (device.statusChangedAt) {
      this.setTime(device.statusChangedAt, device?.bookedBefore || 0)
    }
  }

  async setTime(statusChangedAt: string, bookedBefore: number): Promise<void> {
    const expireTime = new Date(new Date(statusChangedAt).getTime() + bookedBefore)

    this.bookedBeforeTime = expireTime.toISOString()
  }
}
