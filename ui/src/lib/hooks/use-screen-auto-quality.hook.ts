import { useEffect } from 'react'
import { useInjection } from 'inversify-react'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

export const useScreenAutoQuality = (): void => {
  const deviceControlStore = useInjection(CONTAINER_IDS.deviceControlStore)

  useEffect(() => {
    const intervalId = setInterval(() => {
      deviceControlStore.autoQuality()
    }, 5000)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [])
}
