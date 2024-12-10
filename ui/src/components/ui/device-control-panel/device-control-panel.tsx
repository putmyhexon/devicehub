import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Div, Panel, View } from '@vkontakte/vkui'
import {
  Icon16Square4Outline,
  Icon20FolderSimpleArrowUpOutline,
  Icon20LightbulbStarOutline,
  Icon20SubtitlesOutline,
  Icon24InfoCircleOutline,
} from '@vkontakte/icons'

import { TabsPanel } from '@/components/lib/tabs-panel'

import {
  getControlRoute,
  getControlLogsRoute,
  getControlInfoRoute,
  getControlAdvancedRoute,
  getControlFileExplorerRoute,
} from '@/constants/route-paths'

import { DashboardTab } from './tabs/dashboard-tab'

import styles from './device-control-panel.module.css'

import type { TabsContent } from '@/components/lib/tabs-panel'

export const DeviceControlPanel = () => {
  const { t } = useTranslation()
  const { serial } = useParams()

  const tabsContent = useMemo<TabsContent[]>(
    () => [
      {
        id: getControlRoute(serial || ''),
        title: t('Dashboard'),
        before: <Icon16Square4Outline height={17} width={17} />,
        ariaControls: 'tab-content-dashboard',
        content: <DashboardTab />,
      },
      {
        id: getControlLogsRoute(serial || ''),
        title: t('Logs'),
        before: <Icon20SubtitlesOutline height={17} width={17} />,
        ariaControls: 'tab-content-logs',
        content: <Div />,
      },
      {
        id: getControlAdvancedRoute(serial || ''),
        title: t('Advanced'),
        before: <Icon20LightbulbStarOutline height={17} width={17} />,
        ariaControls: 'tab-content-advanced',
        content: <Div />,
      },
      {
        id: getControlFileExplorerRoute(serial || ''),
        title: t('File Explorer'),
        before: <Icon20FolderSimpleArrowUpOutline height={17} width={17} />,
        ariaControls: 'tab-content-explorer',
        content: <Div />,
      },
      {
        id: getControlInfoRoute(serial || ''),
        title: t('Info'),
        before: <Icon24InfoCircleOutline height={17} width={17} />,
        ariaControls: 'tab-content-info',
        content: <Div />,
      },
    ],
    [t, serial]
  )

  return (
    <View activePanel='control'>
      <Panel className={styles.deviceControlPanel} id='control'>
        <TabsPanel content={tabsContent} routeSync />
      </Panel>
    </View>
  )
}
