import { Flex } from '@vkontakte/vkui'
import { useTranslation } from 'react-i18next'
import { useInjection } from 'inversify-react'
import { Icon20AddSquareOutline, Icon20ShuffleOutline, Icon20WrenchOutline } from '@vkontakte/icons'

import { DeviceControlCard } from '@/components/ui/device-control-panel/device-control-card'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { MaintenanceControl } from './maintenance-control'
import { PortForwardingControl } from './port-forwarding-control'

import styles from './advanced-tab.module.css'

export const AdvancedTab = () => {
  const { t } = useTranslation()

  const portForwardingService = useInjection(CONTAINER_IDS.portForwardingService)

  return (
    <Flex align='start' className={styles.advancedTab} gap='l' justify='space-between'>
      <DeviceControlCard
        afterButtonIcon={<Icon20AddSquareOutline />}
        afterTooltipText={t('Add')}
        before={<Icon20ShuffleOutline />}
        className={styles.controlCard}
        title={t('Port Forwarding')}
        onAfterButtonClick={() => portForwardingService.addPortForward()}
      >
        <PortForwardingControl />
      </DeviceControlCard>
      <DeviceControlCard before={<Icon20WrenchOutline />} className={styles.controlCard} title={t('Maintenance')}>
        <MaintenanceControl />
      </DeviceControlCard>
    </Flex>
  )
}
