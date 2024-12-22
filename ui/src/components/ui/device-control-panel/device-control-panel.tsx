import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Div, Panel, View } from '@vkontakte/vkui'
import {
  Icon20HomeOutline,
  Icon20FlashOutline,
  Icon24InfoCircleOutline,
  Icon20ArticleBoxOutline,
  Icon20FolderSimpleOutline,
} from '@vkontakte/icons'

import { TabsPanel } from '@/components/lib/tabs-panel'

import { useDeviceSerial } from '@/lib/hooks/use-device-serial.hook'

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
  const serial = useDeviceSerial()

  const tabsContent = useMemo<TabsContent[]>(
    () => [
      {
        id: getControlRoute(serial),
        title: t('Dashboard'),
        before: <Icon20HomeOutline height={17} width={17} />,
        ariaControls: 'tab-content-dashboard',
        content: <DashboardTab />,
      },
      {
        id: getControlLogsRoute(serial),
        title: t('Logs'),
        before: <Icon20ArticleBoxOutline height={17} width={17} />,
        ariaControls: 'tab-content-logs',
        content: <Div />,
      },
      {
        id: getControlAdvancedRoute(serial),
        title: t('Advanced'),
        before: <Icon20FlashOutline height={17} width={17} />,
        ariaControls: 'tab-content-advanced',
        content: <Div />,
      },
      {
        id: getControlFileExplorerRoute(serial),
        title: t('File Explorer'),
        before: <Icon20FolderSimpleOutline height={17} width={17} />,
        ariaControls: 'tab-content-explorer',
        content: <Div />,
      },
      {
        id: getControlInfoRoute(serial),
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
