import { openstfApiClient } from './openstf-api-client'
import { isOriginGroup } from '@/lib/utils/is-origin-group.util'

import { DEVICE_GROUPS_FIELDS, DEVICE_LIST_FIELDS, USERS_GROUPS_FIELDS } from '@/constants/request-fields'

import { OPENSTF_API_ROUTES } from './routes'

import type { GroupUser } from '@/types/group-user.type'
import type {
  GroupUserArgs,
  GroupDeviceArgs,
  ParamsWithoutFields,
  GroupDeviceWithClassArgs,
  UsersWithFieldsListResponse,
  DeviceWithFieldsListResponse,
} from './types'
import type { GroupDevice } from '@/types/group-device.type'
import type { ListDevice } from '@/types/list-device.type'
import type {
  User,
  Device,
  UserResponse,
  GroupPayload,
  GroupResponse,
  DeviceResponse,
  GetUsersParams,
  GetGroupsParams,
  DefaultResponse,
  GetDevicesParams,
  GroupListResponse,
  AccessTokensResponse,
  GetDeviceBySerialParams,
  GroupListResponseGroupsItem,
} from '@/generated/types'

const getDevices = async <T>(params?: GetDevicesParams): Promise<T[]> => {
  const { data } = await openstfApiClient.get<DeviceWithFieldsListResponse<T>>(OPENSTF_API_ROUTES.devices, { params })

  return data.devices
}

const getUsers = async <T>(params?: GetUsersParams): Promise<T[]> => {
  const { data } = await openstfApiClient.get<UsersWithFieldsListResponse<T>>(OPENSTF_API_ROUTES.users, { params })

  return data.users
}

const addOriginGroupDevice = async ({ serial, groupId }: GroupDeviceArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.put<DeviceResponse>(OPENSTF_API_ROUTES.deviceGroup(groupId, serial))

  return data.success
}

const addTransientGroupDevice = async ({ serial, groupId }: GroupDeviceArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.put<GroupResponse>(OPENSTF_API_ROUTES.groupDevice(groupId, serial))

  return data.success
}

const removeTransientGroupDevice = async ({ serial, groupId }: GroupDeviceArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.delete<GroupResponse>(OPENSTF_API_ROUTES.groupDevice(groupId, serial))

  return data.success
}

const removeOriginGroupDevice = async ({ serial, groupId }: GroupDeviceArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.delete<DeviceResponse>(OPENSTF_API_ROUTES.deviceGroup(groupId, serial))

  return data.success
}

export const getListDevices = (params?: ParamsWithoutFields<GetDevicesParams>): Promise<ListDevice[]> =>
  getDevices({ ...params, fields: DEVICE_LIST_FIELDS })

export const getGroupDevices = (params?: ParamsWithoutFields<GetDevicesParams>): Promise<GroupDevice[]> =>
  getDevices({ ...params, fields: DEVICE_GROUPS_FIELDS })

export const getDeviceBySerial = async (serial: string, params?: GetDeviceBySerialParams): Promise<Device> => {
  const { data } = await openstfApiClient.get<DeviceResponse>(`${OPENSTF_API_ROUTES.devices}/${serial}`, { params })

  return data.device
}

export const getCurrentUserProfile = async (): Promise<User> => {
  const { data } = await openstfApiClient.get<UserResponse>(OPENSTF_API_ROUTES.user)

  return data.user
}

export const getGroupUsers = (params?: ParamsWithoutFields<GetUsersParams>): Promise<GroupUser[]> =>
  getUsers({ ...params, fields: USERS_GROUPS_FIELDS })

export const getGroups = async (params?: GetGroupsParams): Promise<GroupListResponseGroupsItem[]> => {
  const { data } = await openstfApiClient.get<GroupListResponse>(OPENSTF_API_ROUTES.groups, { params })

  return data.groups
}

export const getAccessTokens = async (): Promise<string[]> => {
  const { data } = await openstfApiClient.get<AccessTokensResponse>(OPENSTF_API_ROUTES.accessTokens)

  return data.titles?.reverse() || []
}

export const addUserInGroup = async ({ groupId, userEmail }: GroupUserArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.put<GroupResponse>(OPENSTF_API_ROUTES.groupUser(groupId, userEmail))

  return data.success
}

export const removeUserFromGroup = async ({ groupId, userEmail }: GroupUserArgs): Promise<boolean> => {
  const { data } = await openstfApiClient.delete<GroupResponse>(OPENSTF_API_ROUTES.groupUser(groupId, userEmail))

  return data.success
}

export const addDeviceToGroup = async ({ groupClass, groupId, serial }: GroupDeviceWithClassArgs): Promise<boolean> => {
  if (isOriginGroup(groupClass)) {
    return addOriginGroupDevice({ serial, groupId })
  }

  return addTransientGroupDevice({ serial, groupId })
}

export const removeDeviceFromGroup = async ({
  groupClass,
  groupId,
  serial,
}: GroupDeviceWithClassArgs): Promise<boolean> => {
  if (isOriginGroup(groupClass)) {
    return removeOriginGroupDevice({ serial, groupId })
  }

  return removeTransientGroupDevice({ serial, groupId })
}

export const createGroup = async (): Promise<boolean> => {
  const { data } = await openstfApiClient.post<GroupResponse>(OPENSTF_API_ROUTES.groups, { state: 'pending' })

  return data.success
}

export const removeGroup = async (id: string): Promise<boolean> => {
  const { data } = await openstfApiClient.delete<DefaultResponse>(`${OPENSTF_API_ROUTES.groups}/${id}`)

  return data.success
}

export const removeGroups = async (ids: string): Promise<boolean> => {
  const { data } = await openstfApiClient.delete<DefaultResponse>(OPENSTF_API_ROUTES.groups, {
    params: { _: Date.now() },
    data: ids ? { ids } : undefined,
  })

  return data.success
}

export const updateGroup = async (id: string, data: GroupPayload): Promise<boolean> => {
  const {
    data: { success },
  } = await openstfApiClient.put<GroupResponse>(`${OPENSTF_API_ROUTES.groups}/${id}`, data)

  return success
}
