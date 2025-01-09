import { useState } from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Icon20RefreshOutline } from '@vkontakte/icons'
import { EllipsisText, Flex, IconButton, Tooltip } from '@vkontakte/vkui'

import { DeviceControlStore } from '@/store/device-control-store'
import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'

import styles from './clipboard-control.module.css'

export const ClipboardControl = observer(() => {
  const { t } = useTranslation()
  const [clipboardContent, setClipboardContent] = useState('')
  const deviceControlStore = useServiceLocator<DeviceControlStore>(DeviceControlStore.name)

  const onGetClipboardContent = async () => {
    const data = await deviceControlStore?.getClipboardContent()

    if (data) {
      setClipboardContent(data)
    }
  }

  return (
    <div className={styles.clipboardControl}>
      <Flex align='center' justify='space-between' noWrap>
        <EllipsisText className={cn({ [styles.clipboardText]: clipboardContent })}>
          {t(clipboardContent || 'Get clipboard contents')}
        </EllipsisText>
        <Tooltip appearance='accent' description={t('Get clipboard contents')}>
          <IconButton
            borderRadiusMode='inherit'
            className={styles.getClipboardButton}
            hoverMode='opacity'
            label='Get clipboard content button'
            onClick={() => onGetClipboardContent()}
          >
            <Icon20RefreshOutline />
          </IconButton>
        </Tooltip>
      </Flex>
    </div>
  )
})
