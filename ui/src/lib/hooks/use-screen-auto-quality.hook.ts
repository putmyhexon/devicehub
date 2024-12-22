import { useEffect } from 'react'

import { DeviceControlStore } from '@/store/device-control-store'

import { useServiceLocator } from './use-service-locator.hook'

export const useScreenAutoQuality = (): void => {
  const deviceControlStore = useServiceLocator<DeviceControlStore>(DeviceControlStore.name)

  useEffect(() => {
    const intervalId = setInterval(() => {
      deviceControlStore?.autoQuality()
    }, 5000)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [])
}
