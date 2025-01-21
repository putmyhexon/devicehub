import { action, makeAutoObservable } from 'mobx'

import { socket } from '@/api/socket'

import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'
import { getDeviceState } from '@/lib/utils/get-device-state.util'
import { DeviceState } from '@/types/enums/device-state.enum'

import { DEVICE_LIKELY_LEAVE_REASON } from '@/constants/device-likely-leave-reason-map'

import { MobxQuery } from './mobx-query'
import { deviceErrorModalStore } from './device-error-modal-store'

import type { AxiosError } from 'axios'
import type { Device } from '@/generated/types'
import type { QueryObserverResult } from '@tanstack/react-query'
import type { DeviceChangeMessage } from '@/types/device-change-message.type'

class DeviceBySerialStore {
  private deviceQuery = new MobxQuery(
    () => ({ ...queries.devices.bySerial(this.serial), staleTime: 3 * (60 * 1000), enabled: !!this.serial }),
    queryClient
  )

  serial = ''

  constructor() {
    makeAutoObservable(this, {
      setSerial: action,
    })

    this.onDeviceChange = this.onDeviceChange.bind(this)
  }

  addDeviceChangeListener(): void {
    socket.on('device.change', this.onDeviceChange)
  }

  removeDeviceChangeListener(): void {
    socket.off('device.change', this.onDeviceChange)
  }

  private async onDeviceChange({ data: changedData }: DeviceChangeMessage<Partial<Device>>): Promise<void> {
    if (changedData.serial !== this.serial) return

    queryClient.setQueryData<Device>(queries.devices.bySerial(this.serial).queryKey, (oldData) => {
      if (!oldData) return undefined

      const newData = { ...oldData, ...changedData }

      const prevDeviceState = getDeviceState(oldData)
      const nextDeviceState = getDeviceState(newData)

      if (
        (prevDeviceState === DeviceState.USING && prevDeviceState !== nextDeviceState) ||
        (prevDeviceState === DeviceState.AUTOMATION && prevDeviceState !== nextDeviceState)
      ) {
        const leaveReason = newData.likelyLeaveReason
          ? DEVICE_LIKELY_LEAVE_REASON[newData.likelyLeaveReason]
          : 'Unknown reason'

        deviceErrorModalStore.setError(leaveReason)

        return newData
      }

      if (
        (nextDeviceState === DeviceState.USING && nextDeviceState !== prevDeviceState) ||
        (nextDeviceState === DeviceState.AUTOMATION && nextDeviceState !== prevDeviceState)
      ) {
        deviceErrorModalStore.clearError()
      }

      return newData
    })
  }

  setSerial(serial: string): void {
    this.serial = serial
  }

  deviceQueryResult(serial: string): QueryObserverResult<Device, AxiosError> {
    this.setSerial(serial)

    return this.deviceQuery.result
  }

  fetch(serial: string): Promise<Device> {
    this.setSerial(serial)

    return this.deviceQuery.fetch()
  }

  refetch(): Promise<QueryObserverResult<Device, AxiosError>> {
    return this.deviceQuery.refetch()
  }
}

export const deviceBySerialStore = new DeviceBySerialStore()
