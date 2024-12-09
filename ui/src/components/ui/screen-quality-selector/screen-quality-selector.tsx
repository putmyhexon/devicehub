import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Flex, Caption, Button } from '@vkontakte/vkui'
import { Icon16Connection } from '@vkontakte/icons'

import { MarkedSliderRange } from '@/components/lib/marked-slider-range'
import { PopoverContainer } from '@/components/lib/popover-container'

import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'
import { DeviceControlStore } from '@/store/device-control-store'

import styles from './screen-quality-selector.module.css'

const QUALITY_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80]

export const ScreenQualitySelector = observer(() => {
  const { t } = useTranslation()
  const deviceControlStore = useServiceLocator<DeviceControlStore>(DeviceControlStore.name)

  const onAfterSliderChange = (quality: number) => {
    deviceControlStore?.changeDeviceQuality(quality)
  }

  const sliderValue = deviceControlStore?.currentQuality

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
            value={sliderValue || 10}
            onAfterChange={onAfterSliderChange}
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
