import { useEffect } from 'react'

import { DeviceControlStore } from '@/store/device-control-store'

import { useServiceLocator } from './use-service-locator.hook'

export const useScreenAutoQuality = (serial?: string): void => {
  const deviceControlStore = useServiceLocator<DeviceControlStore>(DeviceControlStore.name)

  useEffect(() => {
    if (!serial) return undefined

    const intervalId = setInterval(() => {
      deviceControlStore?.autoQuality()
    }, 5000)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [])
}
