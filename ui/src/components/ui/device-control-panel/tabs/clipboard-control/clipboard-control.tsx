import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import { OutputField } from '@/components/lib/output-field'

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
    <OutputField
      afterButtonClick={onGetClipboardContent}
      text={t(clipboardContent || 'Get clipboard contents')}
      tooltipText={t('Get clipboard contents')}
    />
  )
})
