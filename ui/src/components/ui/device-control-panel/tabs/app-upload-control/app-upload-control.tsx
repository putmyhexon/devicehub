import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { FormStatus, Spacing } from '@vkontakte/vkui'

import { FileInput } from '@/components/lib/file-input'
import { ProgressBar } from '@/components/lib/progress-bar'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'
import { useDeviceSerial } from '@/lib/hooks/use-device-serial.hook'

import { ActivityLauncher } from './activity-launcher'

export const AppUploadControl = observer(() => {
  const { t } = useTranslation()
  const serial = useDeviceSerial()
  const [fileInputError, setFileInputError] = useState('')
  const applicationInstallationService = useServiceLocator<ApplicationInstallationService>(
    ApplicationInstallationService.name
  )

  return (
    <>
      <FileInput
        accept={[
          '.apk',
          '.aab',
          '.ipa',
          'application/octet-stream',
          'application/x-authorware-bin',
          'application/vnd.android.package-archive',
        ]}
        onError={(message) => setFileInputError(message)}
        onChange={(file) => {
          if (file) {
            applicationInstallationService?.installFile(serial, file)
          }
        }}
      />
      <Spacing size='3xl' />
      <ConditionalRender conditions={[!!fileInputError]}>
        <FormStatus mode='error' title={t('Error')}>
          {fileInputError}
        </FormStatus>
      </ConditionalRender>
      <ConditionalRender conditions={[!!applicationInstallationService?.isInstalling]}>
        <ProgressBar
          status={applicationInstallationService?.status || 'Initialization'}
          value={applicationInstallationService?.progress || 0}
        />
      </ConditionalRender>
      <ConditionalRender conditions={[!!applicationInstallationService?.isInstalled]}>
        <ActivityLauncher />
      </ConditionalRender>
    </>
  )
})
