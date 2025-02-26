import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'
import { QueryObserverResult } from '@tanstack/react-query'

import { socket } from '@/api/socket'

import { queryClient } from '@/config/queries/query-client'
import { queries } from '@/config/queries/query-key-store'
import { isRootGroup } from '@/lib/utils/is-root-group.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { CurrentUserProfileStore } from '@/store/current-user-profile-store'

import type { GroupListResponseGroupsItem } from '@/generated/types'
import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'
import type { SettingsGroupChangeMessage } from '@/types/settings-group-change-message.type'

@injectable()
export class GroupListService {
  private groupsQuery

  selectedGroups: GroupListResponseGroupsItem[] = []
  needConfirm = true
  currentGroupId = ''
  globalFilter = ''
  currentPage = 1
  pageSize = 5

  constructor(
    @inject(CONTAINER_IDS.factoryMobxQuery) mobxQueryFactory: MobxQueryFactory,
    @inject(CONTAINER_IDS.currentUserProfileStore) private currentUserProfileStore: CurrentUserProfileStore
  ) {
    makeAutoObservable(this)

    this.groupsQuery = mobxQueryFactory(() => ({ ...queries.groups.all }))

    this.onGroupCreate = this.onGroupCreate.bind(this)
    this.onGroupDelete = this.onGroupDelete.bind(this)
    this.onGroupChange = this.onGroupChange.bind(this)

    this.addGroupListeners()
  }

  get groupsQueryResult(): QueryObserverResult<GroupListResponseGroupsItem[]> {
    return this.groupsQuery.result
  }

  get isCanCreateGroup(): boolean {
    const { groups } = this.currentUserProfileStore.profileQueryResult?.data || {}

    const groupConsumedQuota = groups?.quotas?.consumed?.number || 0
    const groupAllocatedQuota = groups?.quotas?.allocated?.number || 0

    return groupConsumedQuota < groupAllocatedQuota
  }

  get filteredGroups(): GroupListResponseGroupsItem[] {
    return this.groupsQueryResult.data?.filter((item) => this.filterGroup(item)) || []
  }

  get joinedGroupIds(): string {
    return this.selectedGroups
      .filter((item) => item?.privilege !== 'root')
      .map((item) => item.id)
      .join(',')
  }

  get paginatedGroups(): GroupListResponseGroupsItem[] {
    return this.filteredGroups.slice(this.pageSize * this.currentPage - this.pageSize, this.pageSize * this.currentPage)
  }

  get isPaginatedGroupsEmpty(): boolean {
    return this.paginatedGroups.length === 0
  }

  get isSelectedGroupsEmpty(): boolean {
    return this.selectedGroups.length === 0
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGroups.length / this.pageSize)
  }

  get isRemoveGroupsDisabled(): boolean {
    return (
      !this.paginatedGroups.length ||
      (this.paginatedGroups.length === 1 && isRootGroup(this.paginatedGroups[0].privilege))
    )
  }

  addGroupListeners(): void {
    socket.on('user.settings.groups.created', this.onGroupCreate)
    socket.on('user.view.groups.created', this.onGroupCreate)

    socket.on('user.settings.groups.deleted', this.onGroupDelete)
    socket.on('user.view.groups.deleted', this.onGroupDelete)

    socket.on('user.settings.groups.updated', this.onGroupChange)
    socket.on('user.view.groups.updated', this.onGroupChange)
  }

  removeGroupChangeListener(): void {
    socket.off('user.settings.groups.created', this.onGroupCreate)
    socket.off('user.view.groups.created', this.onGroupCreate)

    socket.off('user.settings.groups.deleted', this.onGroupDelete)
    socket.off('user.view.groups.deleted', this.onGroupDelete)

    socket.off('user.settings.groups.updated', this.onGroupChange)
    socket.off('user.view.groups.updated', this.onGroupChange)
  }

  setGlobalFilter(value: string): void {
    this.globalFilter = value
  }

  setCurrentPage(value: number): void {
    this.currentPage = value
  }

  setPageSize(value: number): void {
    this.pageSize = value

    this.currentPage = 1
  }

  setSelectedGroups(group: GroupListResponseGroupsItem, checked: boolean): void {
    if (checked) {
      this.selectedGroups.push(group)
    }

    if (!checked) {
      this.selectedGroups = this.selectedGroups.filter((item) => item.id !== group.id)
    }
  }

  toggleNeedConfirm(): void {
    this.needConfirm = !this.needConfirm
  }

  isGroupSelected(groupId?: string): boolean {
    return this.selectedGroups.findIndex((item) => item.id === groupId) !== -1
  }

  async getGroupOwnerEmails(): Promise<string> {
    const currentUserProfileStore = await this.currentUserProfileStore.fetch()

    const emailSeparator = currentUserProfileStore.settings?.emailAddressSeparator
    const emails: string[] = this.selectedGroups.map((item) => item.owner?.email || '')
    const uniqueEmail = Array.from(new Set(emails))

    return uniqueEmail.join(emailSeparator || ',')
  }

  private filterGroup(item: GroupListResponseGroupsItem): boolean {
    if (!this.globalFilter) return true

    const caseInsensitiveSearch = this.globalFilter.toLowerCase()

    if (
      item.id?.toLowerCase()?.startsWith(caseInsensitiveSearch) ||
      item.name?.toLowerCase().startsWith(caseInsensitiveSearch) ||
      item.class?.toLowerCase().startsWith(caseInsensitiveSearch) ||
      item.owner?.name?.toLowerCase().startsWith(caseInsensitiveSearch) ||
      item.devices?.length === Number(caseInsensitiveSearch) ||
      item.users?.length === Number(caseInsensitiveSearch)
    ) {
      return true
    }

    return false
  }

  private async onGroupChange({ group }: SettingsGroupChangeMessage): Promise<void> {
    queryClient.setQueryData<GroupListResponseGroupsItem[]>(queries.groups.all.queryKey, (oldData) => {
      if (!oldData) return []

      return oldData.map((item): GroupListResponseGroupsItem => {
        if (item.id === group.id) {
          return { ...item, ...group }
        }

        return item
      })
    })
  }

  private async onGroupCreate({ group }: SettingsGroupChangeMessage): Promise<void> {
    queryClient.setQueryData<GroupListResponseGroupsItem[]>(queries.groups.all.queryKey, (oldData) => {
      if (!oldData) return []

      const isGroupAlreadyExist = oldData.findIndex((item) => item.id === group.id) !== -1

      if (isGroupAlreadyExist) return oldData

      return [...oldData, group]
    })
  }

  private async onGroupDelete({ group }: SettingsGroupChangeMessage): Promise<void> {
    queryClient.setQueryData<GroupListResponseGroupsItem[]>(queries.groups.all.queryKey, (oldData) => {
      if (!oldData) return []

      return oldData.filter((item) => item.id !== group.id)
    })
  }
}
