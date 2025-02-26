import { useLocation, useNavigate } from 'react-router'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { Group, PanelHeader, Tabs, TabsItem } from '@vkontakte/vkui'

import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './tabs-panel.module.css'

import type { TabsContent } from './types'

type CommonTabsPanelProps<T> = {
  content: TabsContent[]
  className?: string
  routeSync?: T
  mode?: 'plain' | 'card'
}

type TabsPanelProps<T> = T extends false
  ? CommonTabsPanelProps<T> & { onChange: (tabId: string) => void; selectedTabId: string }
  : CommonTabsPanelProps<T> & { onChange?: never; selectedTabId?: never }

export const TabsPanel = <T extends boolean = false>({
  selectedTabId,
  onChange,
  content,
  className,
  routeSync,
  mode = 'card',
}: TabsPanelProps<T>) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const onTabClick = (tabId: string) => {
    if (routeSync) {
      navigate(tabId)
    }

    onChange?.(tabId)
  }

  const selectedId = routeSync ? pathname : selectedTabId

  return (
    <>
      <PanelHeader className={cn(styles.tabsPanel, className)} transparent={mode === 'plain'}>
        <Tabs>
          {content.map((tab) => (
            <TabsItem
              key={tab.id}
              aria-controls={tab.ariaControls}
              before={tab.before}
              id={tab.id}
              selected={tab.id === selectedId}
              status={tab.status}
              onClick={() => onTabClick(tab.id)}
            >
              {t(tab.title)}
            </TabsItem>
          ))}
        </Tabs>
      </PanelHeader>
      {content.map((tab) => (
        <ConditionalRender key={tab.id} conditions={[tab.id === selectedId]}>
          <Group
            aria-controls={tab.ariaControls}
            aria-labelledby={tab.id}
            id={tab.ariaControls}
            mode={mode}
            role='tabpanel'
            separator='hide'
          >
            {tab.content}
          </Group>
        </ConditionalRender>
      ))}
    </>
  )
}
