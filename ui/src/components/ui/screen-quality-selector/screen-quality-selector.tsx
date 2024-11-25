import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flex, Caption, Button } from '@vkontakte/vkui'
import { Icon16Connection } from '@vkontakte/icons'

import { MarkedSliderRange } from '@/components/lib/marked-slider-range'
import { PopoverContainer } from '@/components/lib/popover-container'

import { useDebounce } from '@/lib/hooks/use-debounce.hook'
import { deviceControlStore } from '@/store/device-control-store'

import styles from './screen-quality-selector.module.css'

const QUALITY_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80]

export const ScreenQualitySelector = observer(() => {
  const { t } = useTranslation()
  const { serial } = useParams()
  const debouncedQuality = useDebounce(deviceControlStore.currentQuality, 300)

  const onSliderChange = (value: number) => {
    deviceControlStore.setCurrentQuality(value)
  }

  useEffect(() => {
    if (!serial) return

    deviceControlStore.changeDeviceQuality(serial, debouncedQuality)
  }, [debouncedQuality])

  return (
    <PopoverContainer
      className={styles.screenQualitySelector}
      content={() => (
        <>
          <MarkedSliderRange
            marks={QUALITY_OPTIONS}
            max={80}
            min={10}
            step={10}
            value={deviceControlStore.currentQuality}
            onChange={onSliderChange}
          />
          <Flex justify='space-between'>
            <Caption level='1'>{t('Speed')}</Caption>
            <Caption level='1'>{t('Quality')}</Caption>
          </Flex>
        </>
      )}
    >
      <Button
        appearance='neutral'
        before={<Icon16Connection height={24} width={24} />}
        borderRadiusMode='inherit'
        className={styles.qualityButton}
        mode='tertiary'
        title={t('Quality')}
      />
    </PopoverContainer>
  )
})
