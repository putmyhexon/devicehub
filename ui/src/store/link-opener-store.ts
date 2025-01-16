import { action, makeAutoObservable, runInAction } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

import { serviceLocator } from '@/services/service-locator'

import { DeviceControlStore } from './device-control-store'
import { deviceBySerialStore } from './device-by-serial-store'

export class LinkOpenerStore {
  currentBrowserId: string | undefined

  private readonly deviceControlStore: DeviceControlStore

  constructor(serial: string) {
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'currentBrowserId',
      properties: ['currentBrowserId'],
      storage: window.localStorage,
    }).then(
      action((persistStore) => {
        if (persistStore.isHydrated && !this.currentBrowserId) {
          this.init(serial)
        }
      })
    )

    this.deviceControlStore = serviceLocator.get<DeviceControlStore>(DeviceControlStore.name)

    this.init(serial)
  }

  async init(serial: string): Promise<void> {
    const device = await deviceBySerialStore.fetch(serial)
    const browser = device.browser

    if (!browser?.apps?.length) return

    if (browser.selected) {
      const defaultBrowser = browser.apps.find((app) => app.selected)

      if (defaultBrowser) {
        runInAction(() => {
          this.currentBrowserId = defaultBrowser.id
        })

        return
      }
    }

    const defaultBrowser = browser.apps.find((app) => app.name === 'Browser')

    if (defaultBrowser) {
      runInAction(() => {
        this.currentBrowserId = defaultBrowser.id
      })

      return
    }

    const firstBrowser = browser.apps[0].id

    runInAction(() => {
      this.currentBrowserId = firstBrowser
    })
  }

  setCurrentBrowserId(id: string): void {
    this.currentBrowserId = id
  }

  addHttpToUrl(url: string): string {
    try {
      return new URL(url).toString()
    } catch (error) {
      console.error(error)

      /* NOTE: Check for '://' because a protocol-less URL might include a username:password combination
      Ignores also any query parameter because it may contain a http:// inside
    */
      const hasProtocol = /^(https?):\/\//.test(url.replace(/\?.*/, ''))

      if (!hasProtocol) {
        return this.addHttpToUrl(`https://${url}`)
      }

      return url
    }
  }

  openUrl(url: string): void {
    const urlWithHttp = this.addHttpToUrl(url)

    this.deviceControlStore.openBrowser(urlWithHttp, this.currentBrowserId)
  }

  clearBrowser(): void {
    this.deviceControlStore.clearBrowser(this.currentBrowserId)
  }
}
