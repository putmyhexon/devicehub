import { memo } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@vkontakte/vkui'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { DeviceState } from '@/types/enums/device-state.enum'
import { deviceConnection } from '@/store/device-connection'

import { getControlRoute } from '@/constants/route-paths'

import type { Device } from '@/generated/types'

type DeviceStatusCellProps = {
  serial: Device['serial']
  deviceState: DeviceState
}

export const DeviceStatusCell = memo(({ serial, deviceState }: DeviceStatusCellProps) => {
  const { t } = useTranslation()

  const onStopUsing = () => {
    deviceConnection.stopUsingDevice(serial)
  }

  return (
    <>
      <ConditionalRender conditions={[deviceState === DeviceState.AVAILABLE]}>
        <Link to={getControlRoute(serial)}>
          <Button mode='outline' title={deviceState}>
            {t('Use')}
          </Button>
        </Link>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.ABSENT]}>
        <Button appearance='negative' mode='outline' title={deviceState} disabled>
          {t('Disconnected')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.OFFLINE]}>
        <Button appearance='negative' mode='outline' title={deviceState} disabled>
          {t('Offline')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.UNAUTHORIZED]}>
        <Button appearance='negative' mode='outline' title={deviceState} disabled>
          {t('Unauthorized')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.PREPARING]}>
        <Button appearance='neutral' mode='outline' title={deviceState} disabled>
          {t('Preparing')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.BUSY]}>
        <Button appearance='neutral' mode='outline' title={deviceState} disabled>
          {t('Busy')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.AUTOMATION]}>
        <Button appearance='positive' mode='outline' title={deviceState}>
          {t('Stop Automation')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.USING]}>
        <Button appearance='positive' mode='primary' title={deviceState} onClick={onStopUsing}>
          {t('Stop Using')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.PRESENT]}>
        <Button appearance='neutral' mode='outline' title={deviceState}>
          {t('Connected')}
        </Button>
      </ConditionalRender>
      <ConditionalRender conditions={[deviceState === DeviceState.UNHEALTHY]}>
        <Button appearance='negative' mode='outline' title={deviceState} disabled>
          {t('Unhealthy')}
        </Button>
      </ConditionalRender>
    </>
  )
})
