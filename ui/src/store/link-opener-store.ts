import { makeAutoObservable } from 'mobx'

import { serviceLocator } from '@/services/service-locator'

import { DeviceControlStore } from './device-control-store'
import { deviceBySerialStore } from './device-by-serial-store'

export class LinkOpenerStore {
  currentBrowserId: string | undefined

  private readonly deviceControlStore: DeviceControlStore

  constructor(serial: string) {
    makeAutoObservable(this)

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
        this.currentBrowserId = defaultBrowser.id

        return
      }
    }

    const defaultBrowser = browser.apps.find((app) => app.name === 'Browser')

    if (defaultBrowser) {
      this.currentBrowserId = defaultBrowser.id

      return
    }

    this.currentBrowserId = browser.apps[0].id
  }

  setCurrentBrowserId(id: string): void {
    this.currentBrowserId = id
  }

  addHttpToUrl(url: string): string {
    /* NOTE: Check for '://' because a protocol-less URL might include a username:password combination
      Ignores also any query parameter because it may contain a http:// inside
    */
    return (url.replace(/\?.*/, '').indexOf('://') === -1 ? 'http://' : '') + url
  }

  openUrl(url: string): void {
    const urlWithHttp = this.addHttpToUrl(url)

    this.deviceControlStore.openBrowser(urlWithHttp, this.currentBrowserId)
  }

  clearBrowser(): void {
    this.deviceControlStore.clearBrowser(this.currentBrowserId)
  }
}
