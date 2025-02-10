import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { socket } from '@/api/socket'

import { debounce } from '@/lib/utils/debounce.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { CurrentUserProfileStore } from '@/store/current-user-profile-store'

@injectable()
export class SettingsService {
  private debounceDelay = 250

  dateFormat = 'M/d/yy h:mm:ss a'
  emailSeparator = ','

  constructor(@inject(CONTAINER_IDS.currentUserProfileStore) private currentUserProfileStore: CurrentUserProfileStore) {
    makeAutoObservable(this)

    this.updateEmailSeparator = this.updateEmailSeparator.bind(this)
    this.updateDateFormat = this.updateDateFormat.bind(this)

    this.init()
  }

  async init(): Promise<void> {
    const user = await this.currentUserProfileStore.fetch()

    if (user?.settings?.dateFormat) {
      this.dateFormat = user.settings.dateFormat
    }

    if (user?.settings?.emailAddressSeparator) {
      this.emailSeparator = user.settings.emailAddressSeparator
    }
  }

  setDateFormat(value: string): void {
    this.dateFormat = value

    this.debouncedDateFormat(value)
  }

  setEmailSeparator(value: string): void {
    this.emailSeparator = value

    this.debouncedEmailSeparator(value)
  }

  updateLastUsedDevice(value: string): void {
    this.updateUserSettings({ lastUsedDevice: value })
  }

  updateDateFormat(value: string): void {
    this.updateUserSettings({ dateFormat: value })
  }

  updateEmailSeparator(value: string): void {
    this.updateUserSettings({ emailAddressSeparator: value })
  }

  private debouncedDateFormat = debounce(this.updateDateFormat, this.debounceDelay)
  private debouncedEmailSeparator = debounce(this.updateEmailSeparator, this.debounceDelay)

  private updateUserSettings<T>(data: Record<string, T>): void {
    socket.emit('user.settings.update', data)
  }
}
