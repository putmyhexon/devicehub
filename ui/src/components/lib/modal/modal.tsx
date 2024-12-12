import { useTranslation } from 'react-i18next'
import { Icon20ErrorCircleFillYellow } from '@vkontakte/icons'
import { Button, ButtonGroup, ModalCard, ModalRoot } from '@vkontakte/vkui'

import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './modal.module.css'

type ModalProps = {
  isOpen: boolean
  title: string
  description?: string
  isCancelShown?: boolean
  onOk?: () => void
  onClose: () => void
}

export const Modal = ({ isOpen, title, description, onOk, onClose, isCancelShown = true }: ModalProps) => {
  const { t } = useTranslation()

  const onOkClick = () => {
    onOk?.()
    onClose()
  }

  return (
    <ModalRoot activeModal={isOpen ? 'modal-card' : null} usePortal onClose={onClose}>
      <ModalCard
        className={styles.modal}
        description={description}
        dismissButtonMode='inside'
        icon={<Icon20ErrorCircleFillYellow height={56} width={56} />}
        id='modal-card'
        open={isOpen}
        size={900}
        title={title}
        actions={
          <ButtonGroup align='right' className={styles.modalActions}>
            <Button mode={isCancelShown ? 'secondary' : 'primary'} size='l' onClick={onOkClick}>
              OK
            </Button>
            <ConditionalRender conditions={[isCancelShown]}>
              <Button mode='primary' size='l' onClick={onClose}>
                {t('Cancel')}
              </Button>
            </ConditionalRender>
          </ButtonGroup>
        }
        onClose={onClose}
      />
    </ModalRoot>
  )
}
