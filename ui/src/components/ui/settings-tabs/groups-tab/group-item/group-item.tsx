import { useMemo, useState } from 'react'
import { useInjection } from 'inversify-react'
import { useTranslation } from 'react-i18next'
import { Icon24CheckSquareOutline } from '@vkontakte/icons'
import { Button, Cell, Checkbox, Counter, Tooltip } from '@vkontakte/vkui'

import { WarningModal } from '@/components/ui/modals'
import { TabsPanel } from '@/components/lib/tabs-panel'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { isRootGroup } from '@/lib/utils/is-root-group.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { useRemoveGroup } from '@/lib/hooks/use-remove-group.hook'
import { useUpdateGroup } from '@/lib/hooks/use-update-group.hook'

import { GroupName } from './group-name'
import { Schedule } from './tabs/schedule'
import { GroupUsersTable } from './tabs/group-users-table'
import { GroupDevicesTable } from './tabs/group-devices-table'
import { GroupConflictsTable } from './tabs/group-conflicts-table'

import styles from './group-item.module.css'

import type { MouseEvent } from 'react'
import type { TabsContent } from '@/components/lib/tabs-panel'
import type { GroupListResponseGroupsItem } from '@/generated/types'

type GroupItemProps = {
  group?: GroupListResponseGroupsItem
}

export const GroupItem = ({ group }: GroupItemProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('Users')
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const { mutate: removeGroup } = useRemoveGroup()
  const { mutate: updateGroup } = useUpdateGroup(group?.id || '')

  const groupListService = useInjection(CONTAINER_IDS.groupListService)
  const { conflictsCount } = useInjection(CONTAINER_IDS.groupItemService)

  const onReadyClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    updateGroup({ state: 'ready' })
  }

  const onRemoveGroup = () => {
    if (isRootGroup(group?.privilege) || !group?.id) return

    if (groupListService.needConfirm) {
      setIsConfirmationOpen(true)

      return
    }

    removeGroup(group.id)
  }

  const tabsContent = useMemo<TabsContent[]>(
    () => [
      {
        id: 'Users',
        title: t('Users'),
        ariaControls: 'tab-content-users',
        content: <GroupUsersTable />,
      },
      {
        id: 'Devices',
        title: t('Devices'),
        ariaControls: 'tab-content-devices',
        content: <GroupDevicesTable />,
      },
      {
        id: 'Schedule',
        title: t('Schedule'),
        ariaControls: 'tab-content-schedule',
        content: <Schedule group={group} />,
      },
      {
        id: 'Conflicts',
        title: t('Conflicts'),
        status: (
          <ConditionalRender conditions={[conflictsCount > 0]}>
            <Counter appearance='accent-red' mode='primary' size='s'>
              {conflictsCount}
            </Counter>
          </ConditionalRender>
        ),
        ariaControls: 'tab-content-conflicts',
        content: <GroupConflictsTable />,
      },
    ],
    [t, conflictsCount, group]
  )

  return (
    <div className={styles.groupItem}>
      <Cell
        extraSubtitle={`ID: ${group?.id} - ${t('Owner')}: ${group?.owner?.name}`}
        mode='removable'
        subtitle={`${t('Class')}: ${group?.class} - ${t('Devices')}: ${group?.devices?.length || 0} - ${t('Users')}: ${group?.users?.length || 0}`}
        before={
          <Checkbox
            checked={groupListService.isGroupSelected(group?.id)}
            onChange={(event) => {
              if (group) {
                groupListService.setSelectedGroups(group, event.target.checked)
              }
            }}
          />
        }
        indicator={
          <ConditionalRender conditions={[group?.state === 'pending']}>
            <Tooltip appearance='accent' description={t('Get ready')}>
              <Button
                before={<Icon24CheckSquareOutline className={styles.readyIcon} />}
                hasHover={false}
                mode='tertiary'
                onClick={onReadyClick}
              />
            </Tooltip>
          </ConditionalRender>
        }
        hasActive
        hasHover
        multiline
        onClick={() => setIsOpen((prev) => !prev)}
        onRemove={onRemoveGroup}
      >
        <GroupName groupId={group?.id} name={group?.name} />
      </Cell>
      <ConditionalRender conditions={[isOpen]}>
        <TabsPanel
          content={tabsContent}
          mode='plain'
          selectedTabId={selectedTab}
          onChange={(tabId) => setSelectedTab(tabId)}
        />
      </ConditionalRender>
      <WarningModal
        description={t('Really delete this group')}
        isOpen={isConfirmationOpen}
        title={t('Warning')}
        onClose={() => setIsConfirmationOpen(false)}
        onOk={async () => {
          if (group?.id) {
            removeGroup(group.id)
          }
        }}
      />
    </div>
  )
}
