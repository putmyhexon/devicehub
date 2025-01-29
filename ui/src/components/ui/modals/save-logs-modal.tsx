import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'
import { Icon40DownloadCircle } from '@vkontakte/icons'
import { Button, FormItem, FormLayoutGroup, Input, Spacing } from '@vkontakte/vkui'

import { BaseModal } from '@/components/lib/base-modal'
import { BaseSelect } from '@/components/lib/base-select'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import styles from './modal.module.css'

import type { SelectOption } from '@/components/lib/base-select'
import type { BaseModalProps } from '@/components/lib/base-modal'
import type { LogsFileExtension } from '@/services/save-logs-service/types'

const FILE_EXTENSION_OPTIONS: SelectOption<LogsFileExtension>[] = [
  { name: 'JSON', value: 'json' },
  { name: 'LOG', value: 'log' },
]

export const SaveLogsModal = observer(({ ...props }: Omit<BaseModalProps, 'title' | 'actions' | 'icon'>) => {
  const { t } = useTranslation()

  const saveLogsService = useInjection(CONTAINER_IDS.saveLogsService)

  return (
    <BaseModal
      {...props}
      icon={<Icon40DownloadCircle height={56} width={56} />}
      title={`${t('Export')} ${t('Logs')}`}
      actions={
        <Button
          className={styles.modalActions}
          disabled={!saveLogsService.logsFileName}
          mode='primary'
          size='l'
          onClick={() => saveLogsService.saveLogs()}
        >
          {t('Export')}
        </Button>
      }
    >
      <Spacing size='2xl' />
      <FormLayoutGroup>
        <FormItem top={t('File Name')}>
          <Input
            placeholder={t('File Name')}
            value={saveLogsService.logsFileName}
            onChange={(event) => saveLogsService.setLogsFileName(event.target.value)}
          />
        </FormItem>
        <FormItem top={t('File Extension')}>
          <BaseSelect
            options={FILE_EXTENSION_OPTIONS}
            value={saveLogsService.selectedExtension}
            onChange={(value) => {
              saveLogsService.setSelectedExtension(value as LogsFileExtension)
            }}
          />
        </FormItem>
      </FormLayoutGroup>
    </BaseModal>
  )
})
