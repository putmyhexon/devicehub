import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import {
  Icon16Lock,
  Icon16MailOutline,
  Icon20UsersOutline,
  Icon28InboxOutline,
  Icon16DeleteOutline,
  Icon16UnlockOutline,
  Icon20AddSquareOutline,
} from '@vkontakte/icons'
import { useInjection } from 'inversify-react'
import { Button, ButtonGroup, Flex, Pagination, Placeholder, Search, Tooltip } from '@vkontakte/vkui'

import { WarningModal } from '@/components/ui/modals'
import { BaseSelect } from '@/components/lib/base-select'
import { TitledValue } from '@/components/lib/titled-value'
import { ContentCard } from '@/components/lib/content-card'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { useCreateGroup } from '@/lib/hooks/use-create-group.hook'
import { useRemoveGroups } from '@/lib/hooks/use-remove-groups.hook'

import { GroupList } from './group-list'

import styles from './groups-tab.module.css'

import type { SelectOption } from '@/components/lib/base-select'

const PER_PAGE_OPTIONS: SelectOption<number>[] = [
  { value: 5, name: '5' },
  { value: 10, name: '10' },
  { value: 20, name: '20' },
  { value: 50, name: '50' },
]

export const GroupsTab = observer(() => {
  const { t } = useTranslation()
  const { mutate: removeGroups } = useRemoveGroups()
  const { mutate: createGroup, isPending } = useCreateGroup()
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const groupListService = useInjection(CONTAINER_IDS.groupListService)
  const { isAdmin } = useInjection(CONTAINER_IDS.currentUserProfileStore)
  const { isLoading: isGroupsLoading } = groupListService.groupsQueryResult

  const onWriteEmail = async () => {
    const emails = await groupListService.getGroupOwnerEmails()

    navigator.clipboard.writeText(emails)
  }

  const onRemoveGroups = () => {
    if (groupListService.needConfirm) {
      setIsConfirmationOpen(true)

      return
    }

    removeGroups(groupListService.joinedGroupIds)
  }

  return (
    <ContentCard
      afterButtonIcon={<Icon20AddSquareOutline />}
      afterTooltipText={t('Add')}
      before={<Icon20UsersOutline />}
      className={styles.groupsTab}
      isAfterButtonDisabled={!groupListService.isCanCreateGroup}
      isAfterButtonLoading={isPending}
      title={t('Group list')}
      onAfterButtonClick={() => createGroup()}
    >
      <Flex align='center' justify='space-between' noWrap>
        <Search
          className={styles.search}
          placeholder={t('Search')}
          value={groupListService.globalFilter}
          onChange={(event) => groupListService.setGlobalFilter(event.target.value)}
        />
        <Flex align='center'>
          <ButtonGroup align='center' gap='none' mode='horizontal'>
            <ConditionalRender conditions={[isAdmin]}>
              <Tooltip appearance='accent' description={t('Write an email to the group user selection')}>
                <Button
                  before={<Icon16MailOutline />}
                  className={styles.contactOwners}
                  disabled={groupListService.isSelectedGroupsEmpty}
                  href='mailto:?body=*** Paste the email addresses from the clipboard! ***'
                  mode='link'
                  size='s'
                  onClick={onWriteEmail}
                >
                  {t('Contact Owners')}
                </Button>
              </Tooltip>
            </ConditionalRender>
            <Tooltip appearance='accent' description={t('Enable Disable confirmation for device removing')}>
              <Button
                before={groupListService.needConfirm ? <Icon16Lock /> : <Icon16UnlockOutline />}
                mode='tertiary'
                size='s'
                onClick={() => groupListService.toggleNeedConfirm()}
              >
                {groupListService.needConfirm ? t('Need Confirm') : `${t('No')} ${t('Need Confirm')}`}
              </Button>
            </Tooltip>
            <Tooltip appearance='accent' description={t('Remove selected groups')}>
              <Button
                before={<Icon16DeleteOutline />}
                disabled={groupListService.isRemoveGroupsDisabled}
                mode='tertiary'
                size='s'
                onClick={onRemoveGroups}
              >
                {t('Remove')}
              </Button>
            </Tooltip>
          </ButtonGroup>
          <TitledValue
            className={styles.displayedGroups}
            isValueLoading={isGroupsLoading}
            title={t('Displayed')}
            value={groupListService.paginatedGroups.length}
          />
        </Flex>
      </Flex>
      <Flex align='center' justify='center' noWrap>
        <Pagination
          boundaryCount={1}
          className={styles.pagination}
          currentPage={groupListService.currentPage}
          navigationButtonsStyle='both'
          siblingCount={2}
          totalPages={groupListService.totalPages}
          onChange={(page) => groupListService.setCurrentPage(page)}
        />
        <BaseSelect
          options={PER_PAGE_OPTIONS}
          selectType='plain'
          stretched={false}
          value={groupListService.pageSize}
          onChange={(value) => groupListService.setPageSize(Number(value))}
        />
      </Flex>
      <GroupList />
      <ConditionalRender conditions={[groupListService.isPaginatedGroupsEmpty]}>
        <Placeholder icon={<Icon28InboxOutline />}>{t('Empty')}</Placeholder>
      </ConditionalRender>
      <WarningModal
        description={t('Really delete selected groups')}
        isOpen={isConfirmationOpen}
        title={t('Warning')}
        onClose={() => setIsConfirmationOpen(false)}
        onOk={async () => removeGroups(groupListService.joinedGroupIds)}
      />
    </ContentCard>
  )
})
