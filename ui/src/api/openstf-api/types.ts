import type { DeviceListResponse } from '@/generated/types'
import type { DeviceWithFields } from '@/types/device-with-fields.type'

export type DeviceWithFieldsListResponse = Omit<DeviceListResponse, 'devices'> & {
  devices: DeviceWithFields[]
}
