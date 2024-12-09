import { serviceLocator } from '@/services/service-locator'

export const useServiceLocator = <T>(serviceKey: PropertyKey): T | undefined => serviceLocator.safeGet<T>(serviceKey)
