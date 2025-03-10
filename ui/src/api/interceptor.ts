import { type ErrorResponse } from '@/generated/types'

import { authStore } from '@/store/auth-store'

import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

export const attachTokenOnRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const { jwt } = authStore

  config.headers.Authorization = `Bearer ${jwt}`

  return config
}

export const logoutOnErrorResponse = async (error: AxiosError<ErrorResponse>): Promise<AxiosError<ErrorResponse>> => {
  const originalRequest = error.config

  if (originalRequest && error.response?.status === 401) {
    authStore.logout()
  }

  return Promise.reject(error)
}
