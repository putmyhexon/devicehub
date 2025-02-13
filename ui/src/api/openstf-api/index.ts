import { openstfApiClient } from './openstf-api-client'

import { DEVICE_FIELDS } from '@/constants/device-fields'

import { OPENSTF_API_ROUTES } from './routes'

import type { DeviceWithFieldsListResponse } from './types'
import type { DeviceWithFields } from '@/types/device-with-fields.type'
import type {
  Device,
  UserResponse,
  DeviceResponse,
  UserResponseUser,
  GetDevicesParams,
  GetDeviceBySerialParams,
  AccessTokensResponse,
} from '@/generated/types'

export const getDevicesWithFields = async (params?: Omit<GetDevicesParams, 'fields'>): Promise<DeviceWithFields[]> => {
  const { data } = await openstfApiClient.get<DeviceWithFieldsListResponse>(OPENSTF_API_ROUTES.devices, {
    params: {
      ...params,
      fields: DEVICE_FIELDS,
    },
  })

  return data.devices
}

export const getDeviceBySerial = async (serial: string, params?: GetDeviceBySerialParams): Promise<Device> => {
  const { data } = await openstfApiClient.get<DeviceResponse>(`${OPENSTF_API_ROUTES.devices}/${serial}`, { params })

  return data.device
}

export const getCurrentUserProfile = async (): Promise<UserResponseUser> => {
  const { data } = await openstfApiClient.get<UserResponse>(OPENSTF_API_ROUTES.user)

  return data.user
}

export const getAccessTokens = async (): Promise<string[]> => {
  const { data } = await openstfApiClient.get<AccessTokensResponse>(OPENSTF_API_ROUTES.accessTokens)

  return data.titles?.reverse() || []
}
