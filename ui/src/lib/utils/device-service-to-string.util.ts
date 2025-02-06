import type { DeviceWithFields } from '@/types/device-with-fields.type'

export const deviceServiceToString = (deviceService: DeviceWithFields['service']): string => {
  const services = []

  if (deviceService?.hasGMS) {
    services.push('GMS')
  }

  if (deviceService?.hasHMS) {
    services.push('HMS')
  }

  return services.join(', ')
}
