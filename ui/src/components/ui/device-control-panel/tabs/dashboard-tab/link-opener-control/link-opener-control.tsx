import { useState } from 'react'
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

export const LinkOpenerControl = observer(() => {
  const { t } = useTranslation()
  const serial = useDeviceSerial()
  const [url, setUrl] = useState('')
  const { data: device } = deviceBySerialStore.deviceQueryResult(serial)
  const linkOpenerStore = useServiceLocator<LinkOpenerStore>(LinkOpenerStore.name)

  return (
    <>
      <Input
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
      />
      {device?.browser?.apps?.length && (
        <SegmentedControl
          className={styles.browserList}
          value={linkOpenerStore?.currentBrowserId}
          options={device.browser.apps.map(({ id, type, name }) => ({
            label: <Image alt={name} size={20} src={type && BROWSER_ICON_MAP[type]} title={type} />,
            value: id,
            ['aria-label']: name,
          }))}
          onChange={(value) => {
            if (typeof value === 'string') linkOpenerStore?.setCurrentBrowserId(value)
          }}
        />
      )}
    </>
  )
})
