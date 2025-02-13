import { inject, injectable } from 'inversify'
import { makeAutoObservable } from 'mobx'

import { socket } from '@/api/socket'
import { DeviceWithFields } from '@/types/device-with-fields.type'

import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'
import { DeviceState } from '@/types/enums/device-state.enum'
import { getDeviceState } from '@/lib/utils/get-device-state.util'
import { isDeviceUsable } from '@/lib/utils/is-device-usable.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import type { Device } from '@/generated/types'
import type { QueryObserverResult } from '@tanstack/react-query'
import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'
import type { DeviceChangeMessage } from '@/types/device-change-message.type'

@injectable()
export class DeviceListStore {
  private devicesQuery

  constructor(@inject(CONTAINER_IDS.factoryMobxQuery) mobxQueryFactory: MobxQueryFactory) {
    makeAutoObservable(this)

    this.devicesQuery = mobxQueryFactory(() => ({
      ...queries.devices.all,
      staleTime: Infinity,
    }))

    this.onDeviceChange = this.onDeviceChange.bind(this)

    this.addDeviceChangeListener()
  }

  addDeviceChangeListener(): void {
    socket.on('device.change', this.onDeviceChange)
  }

  removeDeviceChangeListener(): void {
    socket.off('device.change', this.onDeviceChange)
  }

  get devicesQueryResult(): QueryObserverResult<DeviceWithFields[]> {
    return this.devicesQuery.result
  }

  get busyDevicesCount(): number | undefined {
    return this.devicesQuery.data?.reduce(
      (accumulator, item) => (getDeviceState(item) === DeviceState.BUSY ? accumulator + 1 : accumulator),
      0
    )
  }

  get totalNumberDevices(): number | undefined {
    return this.devicesQuery.data?.length
  }

  get usableDevicesCount(): number | undefined {
    return this.devicesQuery.data?.reduce(
      (accumulator, { present, status, ready, using, owner }) =>
        isDeviceUsable({ present, status, ready, using, hasOwner: !!owner }) ? accumulator + 1 : accumulator,
      0
    )
  }

  get usingDevicesCount(): number | undefined {
    return this.devicesQuery.data?.reduce((accumulator, item) => (item.using ? accumulator + 1 : accumulator), 0)
  }

  private async onDeviceChange({ data: changedData }: DeviceChangeMessage<Partial<Device>>): Promise<void> {
    const deviceList = await queryClient.ensureQueryData({ ...queries.devices.all })

    queryClient.setQueryData<Device[]>(queries.devices.all.queryKey, (oldData) => {
      if (!oldData) return deviceList

      return oldData.map((item) => {
        if (item.serial === changedData.serial) {
          return { ...item, ...changedData }
        }

        return item
      })
    })
  }
}
