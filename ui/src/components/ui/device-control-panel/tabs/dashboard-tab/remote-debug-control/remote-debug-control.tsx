import { useInjection } from 'inversify-react'
import { useTranslation } from 'react-i18next'
import { Icon20BugOutline, Icon20CopyOutline } from '@vkontakte/icons'

import { OutputField } from '@/components/lib/output-field'
import { DeviceControlCard } from '@/components/ui/device-control-panel/device-control-card'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

export const RemoteDebugControl = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  const deviceConnection = useInjection(CONTAINER_IDS.deviceConnection)

  return (
    <DeviceControlCard
      afterButtonIcon={<Icon20CopyOutline />}
      afterTooltipText={t('Copy link')}
      before={<Icon20BugOutline />}
      className={className}
      helpTooltipText={t('Run the following on your command line to debug the device from your IDE')}
      title={t('Remote debug')}
      onAfterButtonClick={() => navigator.clipboard.writeText(deviceConnection.debugCommand)}
    >
      <OutputField text={deviceConnection.debugCommand} />
    </DeviceControlCard>
  )
}
