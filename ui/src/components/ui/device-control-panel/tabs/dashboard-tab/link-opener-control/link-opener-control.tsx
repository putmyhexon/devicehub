import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon24OpenIn } from '@vkontakte/icons'
import { useTranslation } from 'react-i18next'
import { IconButton, Image, Input, SegmentedControl, Tooltip } from '@vkontakte/vkui'

import { deviceBySerialStore } from '@/store/device-by-serial-store'
import { useDeviceSerial } from '@/lib/hooks/use-device-serial.hook'
import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'
import { LinkOpenerStore } from '@/store/link-opener-store'

import { BROWSER_ICON_MAP } from '@/constants/browser-icon-map'

import styles from './link-opener-control.module.css'

import type { KeyboardEvent } from 'react'
import type { SegmentedControlValue } from '@vkontakte/vkui'

export const LinkOpenerControl = observer(() => {
  const { t } = useTranslation()
  const serial = useDeviceSerial()
  const [url, setUrl] = useState('')
  const textInput = useRef<HTMLInputElement>(null)
  const { data: device } = deviceBySerialStore.deviceQueryResult(serial)
  const linkOpenerStore = useServiceLocator<LinkOpenerStore>(LinkOpenerStore.name)

  const onPressEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      linkOpenerStore?.openUrl(url)
    }
  }

  const onBrowserChange = (value: SegmentedControlValue) => {
    if (typeof value === 'string') linkOpenerStore?.setCurrentBrowserId(value)

    textInput.current?.focus()
  }

  return (
    <>
      <Input
        getRef={textInput}
        placeholder='https://vk.com'
        value={url}
        after={
          <Tooltip appearance='accent' description={t('Open')} placement='top'>
            <IconButton disabled={!url} label='open browser link' onClick={() => linkOpenerStore?.openUrl(url)}>
              <Icon24OpenIn />
            </IconButton>
          </Tooltip>
        }
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={onPressEnter}
      />
      {device?.browser?.apps?.length && (
        <SegmentedControl
          className={styles.browserList}
          value={linkOpenerStore?.currentBrowserId}
          options={device.browser.apps.map(({ id, type, name }) => ({
            label: <Image alt={name} size={20} src={type && BROWSER_ICON_MAP[type]} title={type} noBorder />,
            value: id,
            ['aria-label']: name,
          }))}
          onChange={onBrowserChange}
        />
      )}
    </>
  )
})
