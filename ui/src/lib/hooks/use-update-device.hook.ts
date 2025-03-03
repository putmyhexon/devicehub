import { useMutation } from '@tanstack/react-query'

import { updateDevice } from '@/api/openstf-api'

import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'

import type { UseMutationResult } from '@tanstack/react-query'
import type { UpdateDeviceArgs } from '@/api/openstf-api/types'
import type { UnexpectedErrorResponse } from '@/generated/types'
import type { SettingsDevice } from '@/types/settings-device.type'

export const useUpdateDevice = (): UseMutationResult<boolean, UnexpectedErrorResponse, UpdateDeviceArgs> =>
  useMutation({
    mutationFn: (data) => updateDevice(data),
    onMutate: async ({ serial, params }) => {
      await queryClient.cancelQueries({ queryKey: queries.devices.settings.queryKey })
      const previousDevices = queryClient.getQueryData(queries.devices.settings.queryKey)

      queryClient.setQueryData<SettingsDevice[]>(queries.devices.settings.queryKey, (oldData) => {
        if (!oldData) return []

        return oldData.map((item): SettingsDevice => {
          if (item.serial === serial) {
            const changedData: Partial<SettingsDevice> = {
              ...(params?.place && { place: params.place }),
              ...(params?.adbPort && { adbPort: params.adbPort }),
              ...(params?.storageId && { storageId: params.storageId }),
            }

            return { ...item, ...changedData }
          }

          return item
        })
      })

      return { previousDevices }
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queries.devices.settings.queryKey, context?.previousDevices)

      console.error(error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queries.devices.settings.queryKey })
    },
  })
