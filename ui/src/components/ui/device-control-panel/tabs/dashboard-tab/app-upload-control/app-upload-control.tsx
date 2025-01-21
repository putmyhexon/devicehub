import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useInjection } from 'inversify-react'
import { FormStatus, Spacing } from '@vkontakte/vkui'

import { FileInput } from '@/components/lib/file-input'
import { ProgressBar } from '@/components/lib/progress-bar'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { ActivityLauncher } from './activity-launcher'

export const AppUploadControl = observer(() => {
  const { t } = useTranslation()
  const [fileInputError, setFileInputError] = useState('')

  const applicationInstallationService = useInjection(CONTAINER_IDS.applicationInstallationService)

  return (
    <>
      <FileInput
        accept={applicationInstallationService.allowedFileExtensions()}
        onError={(message) => setFileInputError(message)}
        onChange={(file) => {
          if (file) {
            applicationInstallationService.installFile(file)
          }
        }}
      />
      <Spacing size='3xl' />
      <ConditionalRender conditions={[!!fileInputError]}>
        <FormStatus mode='error' title={t('Error')}>
          {fileInputError}
        </FormStatus>
      </ConditionalRender>
      <ConditionalRender conditions={[applicationInstallationService.isInstalling]}>
        <ProgressBar status={applicationInstallationService.status} value={applicationInstallationService.progress} />
      </ConditionalRender>
      <ConditionalRender conditions={[applicationInstallationService.isInstalled]}>
        <ActivityLauncher />
      </ConditionalRender>
    </>
  )
})
