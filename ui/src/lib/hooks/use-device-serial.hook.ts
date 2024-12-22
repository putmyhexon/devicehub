import { useContext } from 'react'

import { DeviceSerialContext } from '@/components/views/control-page/device-serial-provider'

export const useDeviceSerial = (): string => {
  const serial = useContext(DeviceSerialContext)

  return serial
}
