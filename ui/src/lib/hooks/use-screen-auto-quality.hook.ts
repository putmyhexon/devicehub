import { useEffect } from 'react'

import { deviceControlStore } from '@/store/device-control-store'

export const useScreenAutoQuality = (serial?: string): void => {
  useEffect(() => {
    if (!serial) return undefined

    const intervalId = setInterval(() => {
      deviceControlStore.autoQuality(serial)
    }, 5000)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [])
}
