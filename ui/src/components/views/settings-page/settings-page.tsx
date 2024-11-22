import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Div, Panel, View } from '@vkontakte/vkui'

import { TabsPanel } from '@/components/lib/tabs-panel'

import {
  getSettingsDevicesRoute,
  getSettingsGroupsRoute,
  getSettingsKeysRoute,
  getSettingsRoute,
  getSettingsShellRoute,
  getSettingsUsersRoute,
} from '@/constants/route-paths'

import { GeneralSettingsTab } from './tabs/general-settings-tab'

import styles from './settings-page.module.css'

import type { TabsContent } from '@/components/lib/tabs-panel'

export const SettingsPage = () => {
  const { t } = useTranslation()

  const tabsContent = useMemo<TabsContent[]>(
    () => [
      {
        id: getSettingsRoute(),
        title: t('General'),
        ariaControls: 'tab-content-general',
        content: <GeneralSettingsTab />,
      },
      {
        id: getSettingsKeysRoute(),
        title: t('Keys'),
        ariaControls: 'tab-content-keys',
        content: <Div />,
      },
      {
        id: getSettingsGroupsRoute(),
        title: t('Groups'),
        ariaControls: 'tab-content-groups',
        content: <Div />,
      },
      {
        id: getSettingsDevicesRoute(),
        title: t('Devices'),
        ariaControls: 'tab-content-devices',
        content: <Div />,
      },
      {
        id: getSettingsUsersRoute(),
        title: t('Users'),
        ariaControls: 'tab-content-users',
        content: <Div />,
      },
      {
        id: getSettingsShellRoute(),
        title: t('Shell'),
        ariaControls: 'tab-content-shell',
        content: <Div />,
      },
    ],
    []
  )

  return (
    <View activePanel='settings'>
      <Panel className={styles.settingsPageWrapper} id='settings'>
        <TabsPanel content={tabsContent} routeSync />
      </Panel>
    </View>
  )
}
