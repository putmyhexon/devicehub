import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'
import { QueryObserverResult } from '@tanstack/react-query'

import { GroupListResponseGroupsItem } from '@/generated/types'

import { queries } from '@/config/queries/query-key-store'
import { isRootGroup } from '@/lib/utils/is-root-group.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { CurrentUserProfileStore } from '@/store/current-user-profile-store'

import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'

@injectable()
export class GroupListService {
  private groupsQuery

  selectedGroups: GroupListResponseGroupsItem[] = []
  needConfirm = true
  currentGroupId = ''
  globalFilter = ''
  currentPage = 1
  pageSize = 10

  constructor(
    @inject(CONTAINER_IDS.factoryMobxQuery) mobxQueryFactory: MobxQueryFactory,
    @inject(CONTAINER_IDS.currentUserProfileStore) private currentUserProfileStore: CurrentUserProfileStore
  ) {
    makeAutoObservable(this)

    this.groupsQuery = mobxQueryFactory(() => ({ ...queries.groups.all }))
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
}
