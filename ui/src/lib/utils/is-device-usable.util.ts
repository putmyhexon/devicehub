import type { DeviceWithFields } from '@/types/device-with-fields.type'

type IsDeviceUsableArgs = {
  status: DeviceWithFields['status']
  present: DeviceWithFields['present']
  ready: DeviceWithFields['ready']
  using: DeviceWithFields['using']
  hasOwner: boolean
}

export const isDeviceUsable = ({ present, status, ready, hasOwner, using }: IsDeviceUsableArgs): boolean =>
  /*
     NOTE: Usable IF device is physically present AND device is online AND
     preparations are ready AND the device has no owner or we are the owner
  */
  Boolean(present && status === 3 && ready && (!hasOwner || using))
