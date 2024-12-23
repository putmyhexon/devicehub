import { useParams } from 'react-router'

import { DeviceSerialContext } from './device-serial-context'

import type { ReactNode } from 'react'

export const DeviceSerialProvider = ({ children }: { children: ReactNode }) => {
  const { serial } = useParams()

  return <DeviceSerialContext.Provider value={serial || ''}>{children}</DeviceSerialContext.Provider>
}
