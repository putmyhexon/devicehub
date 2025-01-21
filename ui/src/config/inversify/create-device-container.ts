import { Container } from 'inversify'

import { BookingService } from '@/services/booking-service'
import { TouchService } from '@/services/touch-service/touch-service'
import { ScalingService } from '@/services/scaling-service/scaling-service'
import { KeyboardService } from '@/services/keyboard-service/keyboard-service'
import { ApplicationInstallationService } from '@/services/application-installation/application-installation-service'

import { LinkOpenerStore } from '@/store/link-opener-store'
import { DeviceConnection } from '@/store/device-connection'
import { ShellControlStore } from '@/store/shell-control-store'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { DeviceControlStore } from '@/store/device-control-store'
import { DeviceBySerialStore } from '@/store/device-by-serial-store'
import { DeviceScreenStore } from '@/store/device-screen-store/device-screen-store'

/* NOTE:
  Creating a container for a specific device, isolating its dependencies, and ensuring that the
  `serial` value is available within the container's scope. This allows services to be resolved
  specifically for the corresponding device, enabling scoped dependency management in multi-device scenarios
*/
export const createDeviceContainer = (serial: string): Container => {
  /* NOTE:
    Inversify-react automatically establishes a hierarchy of containers 
    (https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md) 
    within the React tree when multiple Providers are used.
    This means that if the device container lacks bindings, it passes the request up to its parent
    container (in our case, globalContainer)
  */
  const deviceContainer = new Container()

  deviceContainer.bind<string>(CONTAINER_IDS.deviceSerial).toConstantValue(serial)

  deviceContainer.bind<TouchService>(CONTAINER_IDS.touchService).to(TouchService).inSingletonScope()
  deviceContainer.bind<ScalingService>(CONTAINER_IDS.scalingService).to(ScalingService).inSingletonScope()
  deviceContainer.bind<BookingService>(CONTAINER_IDS.bookingService).to(BookingService).inSingletonScope()
  deviceContainer.bind<LinkOpenerStore>(CONTAINER_IDS.linkOpenerStore).to(LinkOpenerStore).inSingletonScope()
  deviceContainer.bind<KeyboardService>(CONTAINER_IDS.keyboardService).to(KeyboardService).inSingletonScope()
  deviceContainer.bind<DeviceConnection>(CONTAINER_IDS.deviceConnection).to(DeviceConnection).inSingletonScope()
  deviceContainer.bind<ShellControlStore>(CONTAINER_IDS.shellControlStore).to(ShellControlStore).inSingletonScope()
  deviceContainer.bind<DeviceScreenStore>(CONTAINER_IDS.deviceScreenStore).to(DeviceScreenStore).inSingletonScope()
  deviceContainer.bind<DeviceControlStore>(CONTAINER_IDS.deviceControlStore).to(DeviceControlStore).inSingletonScope()
  deviceContainer
    .bind<DeviceBySerialStore>(CONTAINER_IDS.deviceBySerialStore)
    .to(DeviceBySerialStore)
    .inSingletonScope()
  deviceContainer
    .bind<ApplicationInstallationService>(CONTAINER_IDS.applicationInstallationService)
    .to(ApplicationInstallationService)
    .inSingletonScope()

  return deviceContainer
}
