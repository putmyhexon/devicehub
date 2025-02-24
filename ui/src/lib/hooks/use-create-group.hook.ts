import { useMutation } from '@tanstack/react-query'

import { createGroup } from '@/api/openstf-api'

import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'

import type { AxiosError } from 'axios'
import type { UseMutationResult } from '@tanstack/react-query'
import type { UnexpectedErrorResponse } from '@/generated/types'

export const useCreateGroup = (): UseMutationResult<boolean, AxiosError<UnexpectedErrorResponse>, void> =>
  useMutation({
    mutationFn: () => createGroup(),
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: queries.groups.all.queryKey }),
  })
