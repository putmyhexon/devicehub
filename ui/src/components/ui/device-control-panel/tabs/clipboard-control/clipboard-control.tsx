import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Icon20RefreshOutline } from '@vkontakte/icons'
import { IconButton, Input, Tooltip } from '@vkontakte/vkui'

import { DeviceControlStore } from '@/store/device-control-store'
import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'

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
    <Input
      placeholder={t('Get clipboard contents')}
      type='text'
      value={t(clipboardContent)}
      after={
        <Tooltip appearance='accent' description={t('Get clipboard contents')}>
          <IconButton hoverMode='opacity' onClick={() => onGetClipboardContent()}>
            <Icon20RefreshOutline />
          </IconButton>
        </Tooltip>
      }
    />
  )
})
