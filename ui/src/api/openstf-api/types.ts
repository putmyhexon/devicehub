import type { DeviceListResponse, GroupPayloadClass, UserListResponse } from '@/generated/types'

export type ParamsWithoutFields<T> = Omit<T, 'fields'>
export type UsersWithFieldsListResponse<T> = Omit<UserListResponse, 'users'> & { users: T[] }
export type DeviceWithFieldsListResponse<T> = Omit<DeviceListResponse, 'devices'> & { devices: T[] }

export type GroupUserArgs = {
  groupId: string
  userEmail?: string
}

export type GroupDeviceArgs = {
  groupId: string
  serial?: string
}

export type GroupDeviceWithClassArgs = GroupDeviceArgs & { groupClass?: GroupPayloadClass }
