import { createQueryKeyStore } from '@lukemorales/query-key-factory'

import { getAuthContact, getAuthDocs, getManifest } from '@/api/openstf'
import {
  getAccessTokens,
  getCurrentUserProfile,
  getDeviceBySerial,
  getGroupDevices,
  getGroups,
  getGroupUsers,
  getListDevices,
} from '@/api/openstf-api'

import type { GroupDevice } from '@/types/group-device.type'
import type { ParamsWithoutFields } from '@/api/openstf-api/types'
import type { inferQueryKeyStore } from '@lukemorales/query-key-factory'
import type { GetManifestResponse } from '@/api/openstf/types'
import type { Device, GetDevicesParams } from '@/generated/types'

export const queries = createQueryKeyStore({
  devices: {
    list: {
      queryKey: null,
      queryFn: () => getListDevices(),
    },
    group: (params?: ParamsWithoutFields<GetDevicesParams>) => ({
      queryKey: [params],
      queryFn: (): Promise<GroupDevice[]> => getGroupDevices(params),
    }),
    bySerial: (serial: string) => ({
      queryKey: [serial],
      queryFn: (): Promise<Device> => getDeviceBySerial(serial),
    }),
  },
  users: {
    group: {
      queryKey: null,
      queryFn: () => getGroupUsers(),
    },
  },
  user: {
    profile: {
      queryKey: null,
      queryFn: () => getCurrentUserProfile(),
    },
    accessTokens: {
      queryKey: null,
      queryFn: () => getAccessTokens(),
    },
  },
  groups: {
    all: {
      queryKey: null,
      queryFn: () => getGroups(),
    },
  },
  auth: {
    docs: {
      queryKey: null,
      queryFn: () => getAuthDocs(),
    },
    contact: {
      queryKey: null,
      queryFn: () => getAuthContact(),
    },
  },
  s: {
    apk: (href: string) => ({
      queryKey: [href],
      queryFn: (): Promise<GetManifestResponse> => getManifest(href),
    }),
  },
})

export type QueryKeys = inferQueryKeyStore<typeof queries>
