import { useState } from 'react'
import { useInjection } from 'inversify-react'
import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@vkontakte/vkui'

import { WarningModal } from '@/components/ui/modals'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import styles from './maintenance-control.module.css'

export const MaintenanceControl = () => {
  const { t } = useTranslation()
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const deviceControlStore = useInjection(CONTAINER_IDS.deviceControlStore)

  return (
    <Flex align='center' justify='center'>
      <Button
        appearance='negative'
        className={styles.restartButton}
        size='m'
        stretched
        onClick={() => setIsConfirmationOpen(true)}
      >
        {t('Restart Device')}
      </Button>
      <WarningModal
        description={`${t('Are you sure you want to reboot this device?')} ${t('The device will be unavailable for a moment')}`}
        isOpen={isConfirmationOpen}
        title={t('Warning')}
        onClose={() => setIsConfirmationOpen(false)}
        onOk={async () => {
          const result = await deviceControlStore.reboot().promise

          console.info(result)
        }}
      />
    </Flex>
  )
}
