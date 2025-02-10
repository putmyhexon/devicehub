import { createQueryKeyStore } from '@lukemorales/query-key-factory'

import { getAuthContact, getAuthDocs, getManifest } from '@/api/openstf'
import { getAccessTokens, getCurrentUserProfile, getDeviceBySerial, getDevicesWithFields } from '@/api/openstf-api'

import type { inferQueryKeyStore } from '@lukemorales/query-key-factory'
import type { GetManifestResponse } from '@/api/openstf/types'
import type { Device } from '@/generated/types'

export const queries = createQueryKeyStore({
  devices: {
    all: {
      queryKey: null,
      queryFn: () => getDevicesWithFields(),
    },
    bySerial: (serial: string) => ({
      queryKey: [serial],
      queryFn: (): Promise<Device> => getDeviceBySerial(serial),
    }),
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
