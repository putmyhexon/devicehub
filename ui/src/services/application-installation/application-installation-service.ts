import { makeAutoObservable } from 'mobx'

import { uploadFile } from '@/api/openstf'
import { serviceLocator } from '@/services/service-locator'

import { MobxQuery } from '@/store/mobx-query'
import { MobxMutation } from '@/store/mobx-mutation'
import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'
import { DeviceControlStore } from '@/store/device-control-store'
import { deviceBySerialStore } from '@/store/device-by-serial-store'

import type { Manifest } from '@/types/manifest.type'
import type { ActivityOptions, ActivityOptionsSet, RunActivityArgs, SelectOption } from './types'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/generated/types'
import type { QueryObserverResult } from '@tanstack/react-query'
import type { GetManifestResponse, UploadFileResponse } from '@/api/openstf/types'

export class ApplicationInstallationService {
  private manifestQuery = new MobxQuery(() => ({ ...queries.s.apk(this.href), enabled: !!this.href }), queryClient)

  href = ''
  status = ''
  progress = 0
  isInstalling = false
  isInstalled = false

  uploadFileMutate = new MobxMutation<UploadFileResponse, ErrorResponse, { type: string; file: File }>(
    { mutationFn: (data): Promise<UploadFileResponse> => uploadFile(data.type, data.file) },
    queryClient
  )

  private readonly deviceControlStore: DeviceControlStore

  constructor() {
    makeAutoObservable(this)

    this.deviceControlStore = serviceLocator.get<DeviceControlStore>(DeviceControlStore.name)
  }

  get manifestQueryResult(): QueryObserverResult<GetManifestResponse, AxiosError> {
    return this.manifestQuery.result
  }

  get activityOptions(): ActivityOptions {
    const options = this.manifestQuery.data?.manifest.application.activities.reduce<ActivityOptionsSet>(
      (acc, activity) => {
        if (activity.name && !acc.activityNames.has(activity.name)) {
          acc.activityNames.add(activity.name)
        }

        activity.intentFilters.forEach((filter) => {
          filter.actions.forEach((action) => {
            if (action.name && !acc.activityActions.has(action.name)) {
              acc.activityActions.add(action.name)
            }
          })

          filter.categories.forEach((category) => {
            if (category.name && !acc.activityCategories.has(category.name)) {
              acc.activityCategories.add(category.name)
            }
          })

          filter.data.forEach(({ scheme, host, port, path, pathPrefix, pathPattern, mimeType }) => {
            if (scheme) {
              let uri = scheme + '://'

              if (host) {
                uri += host
              }

              if (port) {
                uri += port
              }

              if (path || pathPrefix || pathPattern) {
                uri += '/' + (path || pathPrefix || pathPattern)
              }

              if (!acc.activityData.has(uri)) {
                acc.activityData.add(uri)
              }
            }

            if (mimeType && !acc.activityData.has(mimeType)) {
              acc.activityData.add(mimeType)
            }
          })
        })

        return acc
      },
      {
        activityNames: new Set(),
        activityActions: new Set(),
        activityCategories: new Set(),
        activityData: new Set(),
      }
    )

    return {
      activityNames: Array.from(options?.activityNames || [], (item) => ({ value: item, label: item })),
      activityActions: Array.from(options?.activityActions || [], (item) => ({ value: item, label: item })),
      activityCategories: Array.from(options?.activityCategories || [], (item) => ({ value: item, label: item })),
      activityData: Array.from(options?.activityData || [], (item) => ({ value: item, label: item })),
    }
  }

  get packageOptions(): SelectOption[] {
    const manifestPackage = this.manifestQuery.data?.manifest.package

    return manifestPackage ? [{ value: manifestPackage, label: manifestPackage }] : []
  }

  runActivity({
    selectedData,
    selectedAction,
    selectedCategory,
    selectedPackageName,
    selectedActivityName,
  }: RunActivityArgs): void {
    let command = 'am start'

    if (selectedAction) {
      command += ' -a ' + selectedAction
    }

    if (selectedCategory) {
      command += ' -c ' + selectedCategory
    }

    if (selectedData) {
      command += ' -d ' + selectedData
    }

    if (selectedPackageName && selectedActivityName) {
      command += ' -n ' + selectedPackageName + '/' + selectedActivityName
    }

    this.deviceControlStore.shell(command)
  }

  async installFile(serial: string, file: File): Promise<void> {
    this.isInstalling = true

    const type = file.name.split('.').pop() || 'apk'

    const data = await this.uploadFileMutate.mutate({ type, file })

    this.progress = 25

    if (!data.success) {
      throw new Error('Failed to upload file')
    }

    this.href = data.resources.file.href

    const device = await deviceBySerialStore.fetch(serial)

    if (device.ios) {
      this.deviceControlStore.installIos({
        href: this.href,
        manifest: { application: { activities: {} } } as unknown as Manifest,
        launch: true,
      })

      return
    }

    const manifestResponse = await this.manifestQuery.fetch()

    if (manifestResponse.success) {
      const install = this.deviceControlStore.install({
        href: this.href,
        manifest: manifestResponse.manifest,
        launch: true,
      })

      const unsubscribeToProgress = install.subscribeToProgress((progress, status) => {
        this.progress = 50 + progress / 2

        switch (status) {
          case 'uploading': {
            this.status = 'Uploading'
            break
          }

          case 'processing': {
            this.status = 'Processing'
            break
          }

          case 'pushing_app': {
            this.status = 'Pushing app'
            break
          }

          case 'installing_app': {
            this.status = 'Installing app'
            break
          }

          case 'launching_app': {
            this.status = 'Launching activity'
            break
          }

          default: {
            this.status = 'Installing app'
          }
        }
      })

      install.promise.then((message) => {
        if (typeof message === 'string') {
          this.status = message
        }

        this.progress = 100
        this.isInstalling = false
        this.isInstalled = true

        unsubscribeToProgress()
      })
    }

    if (!manifestResponse.success) {
      throw new Error('Failed to get manifest')
    }
  }

  async uninstall(packageName: string): Promise<void> {
    await this.deviceControlStore.uninstall(packageName).promise

    this.clear()
  }

  clear(): void {
    queryClient.resetQueries({ queryKey: queries.s.apk(this.href).queryKey, exact: true })

    this.progress = 0
    this.isInstalling = false
    this.isInstalled = false
    this.status = ''
    this.href = ''
  }
}
