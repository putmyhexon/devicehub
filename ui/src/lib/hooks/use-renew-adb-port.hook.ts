import { useMutation } from '@tanstack/react-query'

import { renewAdbPort } from '@/api/openstf-api'

import type { UseMutationResult } from '@tanstack/react-query'
import type { UnexpectedErrorResponse } from '@/generated/types'

export const useRenewAdbPort = (): UseMutationResult<number, UnexpectedErrorResponse, string> =>
  useMutation({
    mutationFn: (data) => renewAdbPort(data),
  })
