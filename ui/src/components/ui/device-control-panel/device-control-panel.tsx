import { useMemo, useState } from 'react'
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

import styles from './device-control-panel.module.css'

import type { TabsContent } from '@/components/lib/tabs-panel'

export const DeviceControlPanel = () => {
  const { t } = useTranslation()

  const tabsContent = useMemo<TabsContent[]>(
    () => [
      {
        id: 'tab-dashboard',
        title: t('Dashboard'),
        before: <Icon16Square4Outline height={17} width={17} />,
        ariaControls: 'tab-content-dashboard',
        content: <Div />,
      },
      {
        id: 'tab-logs',
        title: t('Logs'),
        before: <Icon20SubtitlesOutline height={17} width={17} />,
        ariaControls: 'tab-content-logs',
        content: <Div />,
      },
      {
        id: 'tab-advanced',
        title: t('Advanced'),
        before: <Icon20LightbulbStarOutline height={17} width={17} />,
        ariaControls: 'tab-content-advanced',
        content: <Div />,
      },
      {
        id: 'tab-explorer',
        title: t('File Explorer'),
        before: <Icon20FolderSimpleArrowUpOutline height={17} width={17} />,
        ariaControls: 'tab-content-explorer',
        content: <Div />,
      },
      {
        id: 'tab-info',
        title: t('Info'),
        before: <Icon24InfoCircleOutline height={17} width={17} />,
        ariaControls: 'tab-content-info',
        content: <Div />,
      },
    ],
    []
  )

  const [selectedTab, setSelectedTab] = useState(tabsContent[0].id)

  return (
    <View activePanel='control'>
      <Panel className={styles.deviceControlPanel} id='control'>
        <TabsPanel content={tabsContent} selectedTabId={selectedTab} onChange={setSelectedTab} />
      </Panel>
    </View>
  )
}
