import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'
import { FormItem, FormLayoutGroup, Input } from '@vkontakte/vkui'

import { LangSwitcher } from '@/components/ui/lang-switcher'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import styles from './general-tab.module.css'

export const GeneralTab = observer(() => {
  const { t } = useTranslation()

  const settingsService = useInjection(CONTAINER_IDS.settingsService)

  return (
    <FormLayoutGroup>
      <FormItem top={t('Language')}>
        <LangSwitcher />
      </FormItem>
      <FormItem top={t('Theme')}>
        <ThemeSwitcher />
      </FormItem>
      <FormItem top={t('Date format')}>
        <Input
          className={styles.input}
          placeholder='e.g. M/d/yy h:mm:ss a'
          value={settingsService.dateFormat}
          onChange={(event) => settingsService.setDateFormat(event.target.value)}
        />
      </FormItem>
      <FormItem top={t('Email address separator')}>
        <Input
          className={styles.input}
          placeholder='e.g. ,'
          value={settingsService.emailSeparator}
          onChange={(event) => settingsService.setEmailSeparator(event.target.value)}
        />
      </FormItem>
    </FormLayoutGroup>
  )
})
