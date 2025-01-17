import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon20ErrorCircleFillRed } from '@vkontakte/icons'
import { Button, ButtonGroup } from '@vkontakte/vkui'

import { BaseModal } from '@/components/lib/base-modal'

import { deviceConnection } from '@/store/device-connection'
import { useDeviceSerial } from '@/lib/hooks/use-device-serial.hook'

import { getDevicesRoute } from '@/constants/route-paths'

import styles from './modal.module.css'

import type { BaseModalProps } from '@/components/lib/base-modal'

export const ErrorModal = ({ ...props }: Omit<BaseModalProps, 'actions' | 'icon'>) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const serial = useDeviceSerial()

  return (
    <BaseModal
      {...props}
      icon={<Icon20ErrorCircleFillRed height={56} width={56} />}
      actions={
        <ButtonGroup className={styles.modalActions} stretched>
          <Button mode={'secondary'} size='l' stretched onClick={() => navigate(0)}>
            {t('Try to reconnect')}
          </Button>
          <Button
            mode='primary'
            size='l'
            stretched
            onClick={() => {
              deviceConnection.stopUsingDevice(serial)

              navigate(getDevicesRoute(), { replace: true })
            }}
          >
            {t('Go to Device List')}
          </Button>
        </ButtonGroup>
      }
    />
  )
}
