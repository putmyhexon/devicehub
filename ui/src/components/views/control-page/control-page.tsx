import Split from 'react-split'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import { Device } from '@/components/ui/device'
import { DeviceControlPanel } from '@/components/ui/device-control-panel'
import { ErrorModal } from '@/components/ui/modals'

import { deviceErrorModalStore } from '@/store/device-error-modal-store'

import { DeviceSerialProvider } from './device-serial-provider'

import styles from './control-page.module.css'

export const ControlPage = observer(() => {
  const { t } = useTranslation()

  return (
    <DeviceSerialProvider>
      <Split
        className={styles.split}
        direction='horizontal'
        gutterSize={4}
        minSize={[200, 0]}
        sizes={[30, 70]}
        snapOffset={10}
      >
        <Device />
        <DeviceControlPanel />
      </Split>
      <ErrorModal
        description={deviceErrorModalStore.fatalMessage}
        isOpen={deviceErrorModalStore.isModalOpen}
        title={t('Device was disconnected')}
        onClose={() => deviceErrorModalStore.closeModal()}
      />
    </DeviceSerialProvider>
  )
})
