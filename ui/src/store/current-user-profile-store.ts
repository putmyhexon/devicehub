import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { queries } from '@/config/queries/query-key-store'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import type { UserResponseUser } from '@/generated/types'
import type { QueryObserverResult } from '@tanstack/react-query'
import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'

@injectable()
export class CurrentUserProfileStore {
  private profileQuery

  constructor(@inject(CONTAINER_IDS.factoryMobxQuery) mobxQueryFactory: MobxQueryFactory) {
    makeAutoObservable(this)

    this.profileQuery = mobxQueryFactory(() => ({
      ...queries.user.profile,
      staleTime: Infinity,
    }))
  }

  get profileQueryResult(): QueryObserverResult<UserResponseUser> {
    return this.profileQuery.result
  }

  fetch(): Promise<UserResponseUser> {
    return this.profileQuery.fetch()
  }
}
