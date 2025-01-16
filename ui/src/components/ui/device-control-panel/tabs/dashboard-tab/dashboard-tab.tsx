import { useTranslation } from 'react-i18next'
import {
  Icon24Upload,
  Icon20BugOutline,
  Icon20CopyOutline,
  Icon20GlobeOutline,
  Icon20DeleteOutline,
  Icon28SettingsOutline,
  Icon28StopwatchOutline,
  Icon20AddSquareOutline,
  Icon20ChevronRightOutline,
  Icon20ClearDataOutline,
} from '@vkontakte/icons'
import { observer } from 'mobx-react-lite'

import { DeviceControlCard } from '@/components/ui/device-control-panel/device-control-card'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { BookingService } from '@/services/booking-service'
import { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'
import { deviceConnection } from '@/store/device-connection'
import { deviceBySerialStore } from '@/store/device-by-serial-store'
import { useDeviceSerial } from '@/lib/hooks/use-device-serial.hook'
import { ShellControlStore } from '@/store/shell-control-store'
import { LinkOpenerStore } from '@/store/link-opener-store'

import { ClipboardControl } from './clipboard-control'
import { AppUploadControl } from './app-upload-control'
import { RemoteDebugControl } from './remote-debug-control'
import { ShellControl } from './shell-control'
import { DeviceButtonsControl } from './device-buttons-control'
import { DeviceBookingControl } from './device-booking-control'
import { LinkOpenerControl } from './link-opener-control'

import styles from './dashboard-tab.module.css'

export const DashboardTab = observer(() => {
  const { t } = useTranslation()
  const serial = useDeviceSerial()
  const { data: device } = deviceBySerialStore.deviceQueryResult(serial)

  const bookingService = useServiceLocator<BookingService>(BookingService.name)
  const shellControlStore = useServiceLocator<ShellControlStore>(ShellControlStore.name)
  const linkOpenerStore = useServiceLocator<LinkOpenerStore>(LinkOpenerStore.name)
  const applicationInstallationService = useServiceLocator<ApplicationInstallationService>(
    ApplicationInstallationService.name
  )

  return (
    <div className={styles.dashboardTabContainer}>
      <div className={styles.dashboardTab}>
        <DeviceControlCard
          before={<Icon28SettingsOutline height={20} width={20} />}
          className={styles.deviceButtons}
          title={t('Device Buttons')}
        >
          <DeviceButtonsControl />
        </DeviceControlCard>
        <ConditionalRender conditions={[!device?.ios]}>
          <DeviceControlCard
            afterButtonIcon={<Icon20CopyOutline />}
            afterTooltipText={t('Copy link')}
            before={<Icon20BugOutline />}
            className={styles.remoteDebug}
            helpTooltipText={t('Run the following on your command line to debug the device from your IDE')}
            title={t('Remote debug')}
            onAfterButtonClick={() => navigator.clipboard.writeText(deviceConnection.debugCommand)}
          >
            <RemoteDebugControl />
          </DeviceControlCard>
        </ConditionalRender>
        <DeviceControlCard
          afterButtonIcon={<Icon20DeleteOutline />}
          afterTooltipText={t('Clear')}
          before={<Icon24Upload height={20} width={20} />}
          className={styles.appUpload}
          title={t('App Upload')}
          onAfterButtonClick={() => applicationInstallationService?.clear()}
        >
          <AppUploadControl />
        </DeviceControlCard>
        <DeviceControlCard
          afterButtonIcon={<Icon20ClearDataOutline />}
          afterTooltipText={t('Reset all browser settings')}
          before={<Icon20GlobeOutline />}
          className={styles.linkOpener}
          title={t('Open link or deeplink')}
          onAfterButtonClick={() => linkOpenerStore?.clearBrowser()}
        >
          <LinkOpenerControl />
        </DeviceControlCard>
        <ConditionalRender conditions={[!device?.ios]}>
          <DeviceControlCard
            afterButtonIcon={<Icon20DeleteOutline />}
            afterTooltipText={t('Clear')}
            before={<Icon20ChevronRightOutline />}
            className={styles.shell}
            helpTooltipText={t('Executes remote shell commands')}
            title={t('Shell')}
            onAfterButtonClick={() => shellControlStore?.clear()}
          >
            <ShellControl />
          </DeviceControlCard>
        </ConditionalRender>
        <DeviceControlCard before={<Icon20CopyOutline />} className={styles.clipboard} title={t('Clipboard')}>
          <ClipboardControl />
        </DeviceControlCard>
        <DeviceControlCard
          afterButtonIcon={<Icon20AddSquareOutline />}
          afterTooltipText={t('Extend booking')}
          before={<Icon28StopwatchOutline height={20} width={20} />}
          className={styles.deviceBooking}
          title={t('Device booking')}
          onAfterButtonClick={() => {
            bookingService?.reBookDevice()
          }}
        >
          <DeviceBookingControl />
        </DeviceControlCard>
      </div>
    </div>
  )
})
