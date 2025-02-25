import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useInjection } from 'inversify-react'
import { Button, Tooltip } from '@vkontakte/vkui'
import { Icon16MailOutline } from '@vkontakte/icons'
import { createColumnHelper } from '@tanstack/react-table'

import { TextWithTranslation } from '@/components/lib/text-with-translation'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { toSentenceCase } from '@/lib/utils/to-sentence-case.util'
import { useAddUserInGroup } from '@/lib/hooks/use-add-user-in-group.hook'
import { useRemoveUserFromGroup } from '@/lib/hooks/use-remove-user-from-group.hook'

import { GroupTable, GroupTopFilters, IsInGroupCell, isInGroupSorting } from '../group-table'

import { GroupUsersColumnIds } from './types'

import type { ColumnDef, Row } from '@tanstack/react-table'
import type { GroupUser } from '@/types/group-user.type'
import type { DataWithGroupStatus } from '@/types/data-with-group-status.type'

const columnHelper = createColumnHelper<DataWithGroupStatus<GroupUser>>()

export const GroupUsersTable = observer(() => {
  const { t } = useTranslation()
  const { mutate: addUsersInGroup } = useAddUserInGroup()
  const { mutate: removeUsersFromGroup } = useRemoveUserFromGroup()

  const groupItemService = useInjection(CONTAINER_IDS.groupItemService)
  const { isLoading } = groupItemService.usersQueryResult

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.isInGroup, {
        id: GroupUsersColumnIds.IS_IN_GROUP,
        sortingFn: isInGroupSorting,
        header: () => (
          <IsInGroupCell
            isAddToGroupDisabled={!groupItemService.currentGroup?.users?.length}
            isInGroup={!groupItemService.isSomeUsersNotInGroup}
            isRemoveFromGroupDisabled={!groupItemService.isCanRemoveAllUsers}
            onAddToGroup={() => addUsersInGroup({ groupId: groupItemService.currentGroupId })}
            onRemoveFromGroup={() => removeUsersFromGroup({ groupId: groupItemService.currentGroupId })}
          />
        ),
        cell: ({ getValue, row }) => {
          const { email: userEmail, privilege } = row.original

          return (
            <IsInGroupCell
              isInGroup={getValue()}
              isRemoveFromGroupDisabled={
                privilege === 'admin' || userEmail === groupItemService.currentGroup?.owner?.email
              }
              onAddToGroup={() => addUsersInGroup({ groupId: groupItemService.currentGroupId, userEmail })}
              onRemoveFromGroup={() => removeUsersFromGroup({ groupId: groupItemService.currentGroupId, userEmail })}
            />
          )
        },
      }),
      columnHelper.accessor((row) => toSentenceCase(row.name || ''), {
        header: () => <TextWithTranslation name='Name' />,
        id: GroupUsersColumnIds.NAME,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor((row) => row.email || '', {
        header: () => <TextWithTranslation name='Email' />,
        id: GroupUsersColumnIds.EMAIL,
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor((row) => toSentenceCase(row.privilege || ''), {
        header: () => <TextWithTranslation name='Privilege' />,
        id: GroupUsersColumnIds.PRIVILEGE,
        cell: ({ getValue }) => getValue(),
      }),
    ],
    []
  ) as ColumnDef<DataWithGroupStatus<GroupUser>>[]

  const onWriteEmail = async (users: Row<DataWithGroupStatus<GroupUser>>[]) => {
    const emails = await groupItemService.getGroupUsersEmails(users)

    navigator.clipboard.writeText(emails)
  }

  return (
    <GroupTable
      columns={columns}
      data={groupItemService.groupUsersData}
      getRowId={(row) => row.email as string}
      isDataLoading={isLoading}
      initialState={{
        sorting: [
          {
            id: GroupUsersColumnIds.IS_IN_GROUP,
            desc: false,
          },
        ],
      }}
    >
      {(table) => (
        <GroupTopFilters table={table}>
          <Tooltip appearance='accent' description={t('Write an email to the group user selection')}>
            <Button
              before={<Icon16MailOutline />}
              disabled={table.getRowModel().rows.length === 0}
              href='mailto:?body=*** Paste the email addresses from the clipboard! ***'
              mode='link'
              size='s'
              onClick={() => onWriteEmail(table.getRowModel().rows)}
            >
              {t('Contact Users')}
            </Button>
          </Tooltip>
        </GroupTopFilters>
      )}
    </GroupTable>
  )
})
