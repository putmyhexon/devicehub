import { useRef } from 'react'
import cn from 'classnames'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Button, ButtonGroup, EllipsisText, Flex, Spinner } from '@vkontakte/vkui'
import { Icon24VerticalRectangle9x16Outline, Icon28DevicesOutline } from '@vkontakte/icons'
import { useTranslation } from 'react-i18next'

import { ConditionalRender } from '@/components/lib/conditional-render'
import { ScreenQualitySelector } from '@/components/ui/screen-quality-selector'

import { deviceScreenStore } from '@/store/device-screen-store/device-screen-store'
import { useScreenAutoQuality } from '@/lib/hooks/use-screen-auto-quality.hook'
import { useScreenStreaming } from '@/lib/hooks/use-screen-streaming.hook'
import { deviceControlStore } from '@/store/device-control-store'

import styles from './device-screen.module.css'

export const DeviceScreen = observer(() => {
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useTranslation()
  const { serial } = useParams()

  useScreenStreaming({ canvasRef, canvasWrapperRef, serial })
  useScreenAutoQuality(serial)

  const deviceTitle = !deviceScreenStore.getDevice?.ios
    ? `${deviceScreenStore.getDevice?.manufacturer || ''} ${deviceScreenStore.getDevice?.marketName || ''}`
    : deviceScreenStore.getDevice?.model || ''

  const currentRotation = `${t('Current rotation:')} ${deviceScreenStore.getScreenRotation}°`

  return (
    <Flex direction='column' noWrap>
      <Flex align='center' className={styles.deviceHeader} justify='space-between'>
        <Flex align='center' className={styles.deviceName} noWrap>
          <Icon28DevicesOutline className={styles.icon} height={25} width={25} />
          <EllipsisText>{deviceTitle}</EllipsisText>
        </Flex>
        <ButtonGroup align='center' gap='none' mode='horizontal'>
          <Button
            appearance='neutral'
            before={<Icon24VerticalRectangle9x16Outline />}
            borderRadiusMode='inherit'
            className={styles.screenRotationButton}
            disabled={!deviceScreenStore.isScreenRotated}
            mode='tertiary'
            title={`${t('Portrait')} (${currentRotation})`}
            onClick={() => {
              if (!serial) return

              deviceControlStore.tryToRotate(serial, 'portrait')
            }}
          />
          <Button
            appearance='neutral'
            before={<Icon24VerticalRectangle9x16Outline />}
            borderRadiusMode='inherit'
            className={cn(styles.screenRotationButton, styles.landscape)}
            disabled={deviceScreenStore.isScreenRotated}
            mode='tertiary'
            title={`${t('Landscape')} (${currentRotation})`}
            onClick={() => {
              if (!serial) return

              deviceControlStore.tryToRotate(serial, 'landscape')
            }}
          />
          <ConditionalRender conditions={[!deviceScreenStore.getDevice?.ios]}>
            <ScreenQualitySelector />
          </ConditionalRender>
        </ButtonGroup>
      </Flex>
      <div ref={canvasWrapperRef} className={styles.deviceScreen}>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={cn(styles.canvas, { [styles.rotated]: deviceScreenStore.isScreenRotated })}
          />
          <ConditionalRender conditions={[deviceScreenStore.isScreenLoading]}>
            <Spinner className={styles.spinner} size='large' />
          </ConditionalRender>
        </div>
      </div>
    </Flex>
  )
})
