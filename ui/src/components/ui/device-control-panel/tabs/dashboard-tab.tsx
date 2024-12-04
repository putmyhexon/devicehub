import { SimpleGrid } from '@vkontakte/vkui'
import { useTranslation } from 'react-i18next'

import {
  DeviceControlCard,
  DeviceControlCardAfter,
  DeviceControlCardIcon,
} from '@/components/ui/device-control-panel/device-control-card'

export const DashboardTab = () => {
  const { t } = useTranslation()

  return (
    <SimpleGrid columns={2} gap='l'>
      <DeviceControlCard icon={DeviceControlCardIcon.SETTINGS} title={t('Device Buttons')}>
        Stub
      </DeviceControlCard>
      <DeviceControlCard
        after={DeviceControlCardAfter.COPY}
        afterTooltipText={t('Copy link')}
        helpTooltipText={t('Run the following on your command line to debug the device from your IDE')}
        icon={DeviceControlCardIcon.BUG}
        title={t('Remote debug')}
      >
        Stub
      </DeviceControlCard>
      <DeviceControlCard
        after={DeviceControlCardAfter.CLEAR}
        icon={DeviceControlCardIcon.UPLOAD}
        title={t('App Upload')}
      >
        Stub
      </DeviceControlCard>
      <DeviceControlCard
        after={DeviceControlCardAfter.CLEAR}
        afterTooltipText={t('Reset all browser settings')}
        icon={DeviceControlCardIcon.GLOBE}
        title={t('Open link or deeplink')}
      >
        Stub
      </DeviceControlCard>
      <DeviceControlCard
        after={DeviceControlCardAfter.CLEAR}
        helpTooltipText={t('Executes remote shell commands')}
        icon={DeviceControlCardIcon.SHELL}
        title={t('Shell')}
      >
        Stub
      </DeviceControlCard>
      <DeviceControlCard icon={DeviceControlCardIcon.COPY} title={t('Clipboard')}>
        Stub
      </DeviceControlCard>
      <DeviceControlCard
        after={DeviceControlCardAfter.ADD}
        helpTooltipText={t('Extend booking')}
        icon={DeviceControlCardIcon.TIME}
        title={t('Device booking')}
      >
        Stub
      </DeviceControlCard>
    </SimpleGrid>
  )
}
