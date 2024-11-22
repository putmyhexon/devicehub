import { useEffect } from 'react'

import { deviceScreenStore } from '@/store/device-screen-store/device-screen-store'
import { debounce } from '@/lib/utils/debounce.util'

import type { RefObject } from 'react'

type UseScreenStreamingArgs = {
  canvasRef: RefObject<HTMLCanvasElement>
  canvasWrapperRef: RefObject<HTMLDivElement>
  serial?: string
}

export const useScreenStreaming = ({ canvasRef, canvasWrapperRef, serial }: UseScreenStreamingArgs): void => {
  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current || !serial) return undefined

    deviceScreenStore.startScreenStreaming(serial, canvasRef.current, canvasWrapperRef.current)

    return (): void => {
      deviceScreenStore.stopScreenStreaming()
    }
  }, [])

  useEffect(() => {
    if (!canvasWrapperRef.current) return undefined

    const debouncedUpdateBounds = debounce(deviceScreenStore.updateBounds, 1000)

    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdateBounds()
    })

    resizeObserver.observe(canvasWrapperRef.current)

    return (): void => {
      if (!canvasWrapperRef.current) return undefined

      resizeObserver.unobserve(canvasWrapperRef.current)

      return undefined
    }
  }, [])
}
