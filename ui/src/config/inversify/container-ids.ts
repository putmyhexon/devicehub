import type { interfaces } from 'inversify'
import type { GroupService } from '@/services/group-service'
import type { DeviceListStore } from '@/store/device-list-store'
import type { LinkOpenerStore } from '@/store/link-opener-store'
import type { BookingService } from '@/services/booking-service'
import type { DeviceConnection } from '@/store/device-connection'
import type { SettingsService } from '@/services/settings-service'
import type { ShellControlStore } from '@/store/shell-control-store'
import type { DeviceControlStore } from '@/store/device-control-store'
import type { DeviceDisconnection } from '@/store/device-disconnection'
import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'
import type { DeviceBySerialStore } from '@/store/device-by-serial-store'
import type { TouchService } from '@/services/touch-service/touch-service'
import type { MobxMutationFactory } from '@/types/mobx-mutation-factory.type'
import type { ScalingService } from '@/services/scaling-service/scaling-service'
import type { CurrentUserProfileStore } from '@/store/current-user-profile-store'
import type { KeyboardService } from '@/services/keyboard-service/keyboard-service'
import type { DeviceScreenStore } from '@/store/device-screen-store/device-screen-store'
import type { TransactionService } from '@/services/core/transaction-service/transaction-service'
import type { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

export const CONTAINER_IDS = {
  deviceSerial: Symbol.for('serial') as interfaces.ServiceIdentifier<string>,
  touchService: Symbol.for('TouchService') as interfaces.ServiceIdentifier<TouchService>,
  groupService: Symbol.for('GroupService') as interfaces.ServiceIdentifier<GroupService>,
  bookingService: Symbol.for('BookingService') as interfaces.ServiceIdentifier<BookingService>,
  scalingService: Symbol.for('ScalingService') as interfaces.ServiceIdentifier<ScalingService>,
  linkOpenerStore: Symbol.for('LinkOpenerStore') as interfaces.ServiceIdentifier<LinkOpenerStore>,
  keyboardService: Symbol.for('KeyboardService') as interfaces.ServiceIdentifier<KeyboardService>,
  deviceListStore: Symbol.for('DeviceListStore') as interfaces.ServiceIdentifier<DeviceListStore>,
  settingsService: Symbol.for('SettingsService') as interfaces.ServiceIdentifier<SettingsService>,
  deviceConnection: Symbol.for('DeviceConnection') as interfaces.ServiceIdentifier<DeviceConnection>,
  factoryMobxQuery: Symbol.for('Factory<MobxQuery>') as interfaces.ServiceIdentifier<MobxQueryFactory>,
  shellControlStore: Symbol.for('ShellControlStore') as interfaces.ServiceIdentifier<ShellControlStore>,
  deviceScreenStore: Symbol.for('DeviceScreenStore') as interfaces.ServiceIdentifier<DeviceScreenStore>,
  deviceControlStore: Symbol.for('DeviceControlStore') as interfaces.ServiceIdentifier<DeviceControlStore>,
  deviceBySerialStore: Symbol.for('DeviceBySerialStore') as interfaces.ServiceIdentifier<DeviceBySerialStore>,
  deviceDisconnection: Symbol.for('DeviceDisconnection') as interfaces.ServiceIdentifier<DeviceDisconnection>,
  factoryMobxMutation: Symbol.for('Factory<MobxMutation>') as interfaces.ServiceIdentifier<MobxMutationFactory>,
  factoryTransactionService: Symbol.for('Factory<TransactionService>') as interfaces.ServiceIdentifier<
    () => TransactionService
  >,
  currentUserProfileStore: Symbol.for(
    'CurrentUserProfileStore'
  ) as interfaces.ServiceIdentifier<CurrentUserProfileStore>,
  applicationInstallationService: Symbol.for(
    'ApplicationInstallationService'
  ) as interfaces.ServiceIdentifier<ApplicationInstallationService>,
}
