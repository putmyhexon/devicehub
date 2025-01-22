import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Flex } from '@vkontakte/vkui'
import { ErrorBoundary } from 'react-error-boundary'
import { useInjection } from 'inversify-react'

import { ErrorFallback } from '@/components/lib/error-fallback'

import { deviceErrorModalStore } from '@/store/device-error-modal-store'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { DeviceTopBar } from './device-top-bar'
import { DeviceScreen } from './device-screen'
import { DeviceNavigationButtons } from './device-navigation-buttons'

export const Device = observer(() => {
  const deviceConnection = useInjection(CONTAINER_IDS.deviceConnection)
  const deviceBySerialStore = useInjection(CONTAINER_IDS.deviceBySerialStore)

  useEffect(() => {
    deviceConnection.useDevice()
    deviceBySerialStore.addDeviceChangeListener()

    return () => {
      deviceBySerialStore.removeDeviceChangeListener()
      deviceErrorModalStore.clearError()
    }
  }, [])

  return (
    <Flex direction='column' noWrap>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <DeviceTopBar />
        <DeviceScreen />
        <DeviceNavigationButtons />
      </ErrorBoundary>
    </Flex>
  )
})
