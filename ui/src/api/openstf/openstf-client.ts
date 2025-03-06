import axios from 'axios'

import { variablesConfig } from '@/config/variables.config'

import { attachTokenOnRequest, logoutOnErrorResponse } from '../interceptor'

export const openstfClient = axios.create({
  baseURL: variablesConfig[import.meta.env.MODE].openStfApiHostUrl,
  withCredentials: true,
})

openstfClient.interceptors.request.use((config) => attachTokenOnRequest(config))
openstfClient.interceptors.response.use((response) => response, logoutOnErrorResponse)
