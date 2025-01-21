import { Container } from 'inversify'

import { GroupService } from '@/services/group-service'
import { SettingsService } from '@/services/settings-service'
import { TransactionService } from '@/services/core/transaction-service/transaction-service'

import { MobxQuery } from '@/store/mobx-query'
import { MobxMutation } from '@/store/mobx-mutation'
import { DeviceListStore } from '@/store/device-list-store'
import { queryClient } from '@/config/queries/query-client'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { DeviceDisconnection } from '@/store/device-disconnection'
import { CurrentUserProfileStore } from '@/store/current-user-profile-store'

import type { interfaces } from 'inversify'
import type { MutationObserverOptions, QueryObserverOptions } from '@tanstack/react-query'

export const globalContainer = new Container()

globalContainer.bind<DeviceDisconnection>(CONTAINER_IDS.deviceDisconnection).to(DeviceDisconnection).inSingletonScope()
globalContainer.bind<SettingsService>(CONTAINER_IDS.settingsService).to(SettingsService).inSingletonScope()
globalContainer.bind<DeviceListStore>(CONTAINER_IDS.deviceListStore).to(DeviceListStore).inSingletonScope()
globalContainer.bind<GroupService>(CONTAINER_IDS.groupService).to(GroupService).inSingletonScope()
globalContainer
  .bind<CurrentUserProfileStore>(CONTAINER_IDS.currentUserProfileStore)
  .to(CurrentUserProfileStore)
  .inSingletonScope()

globalContainer
  .bind<interfaces.Factory<MobxQuery>>(CONTAINER_IDS.factoryMobxQuery)
  .toFactory<MobxQuery, [() => QueryObserverOptions]>(
    () =>
      (getOptions): MobxQuery =>
        new MobxQuery(getOptions, queryClient)
  )
globalContainer
  .bind<interfaces.Factory<MobxMutation>>(CONTAINER_IDS.factoryMobxMutation)
  .toFactory<MobxMutation, [MutationObserverOptions]>(
    () =>
      (options): MobxMutation =>
        new MobxMutation(options, queryClient)
  )
globalContainer
  .bind<interfaces.Factory<TransactionService>>(CONTAINER_IDS.factoryTransactionService)
  .toFactory<TransactionService>(() => (): TransactionService => new TransactionService())
