import { FormItem, FormLayoutGroup } from '@vkontakte/vkui'
import { useTranslation } from 'react-i18next'

import { LangSwitcher } from '@/components/ui/lang-switcher'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

export const GeneralSettingsTab = () => {
  const { t } = useTranslation()

  return (
    <FormLayoutGroup>
      <FormItem top={t('Language')}>
        <LangSwitcher />
      </FormItem>
      <FormItem top={t('Theme')}>
        <ThemeSwitcher />
      </FormItem>
    </FormLayoutGroup>
  )
}
