import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { socket } from '@/api/socket'
import { UserSettingsUpdateMessage } from '@/types/user-settings-update-message.type'

import { debounce } from '@/lib/utils/debounce.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { CurrentUserProfileStore } from '@/store/current-user-profile-store'

import type { AlertMessageData } from './types'

const DEFAULT_DATE_FORMAT = 'M/d/yy h:mm:ss a'
const DEFAULT_EMAIL_SEPARATOR = ','
const DEFAULT_ALERT_MESSAGE: AlertMessageData = {
  data: '*** This site is currently under maintenance, please wait ***',
  activation: 'False',
  level: 'Critical',
}

@injectable()
export class SettingsService {
  private debounceDelay = 250

  dateFormat = DEFAULT_DATE_FORMAT
  emailSeparator = DEFAULT_EMAIL_SEPARATOR
  alertMessage = DEFAULT_ALERT_MESSAGE

  constructor(@inject(CONTAINER_IDS.currentUserProfileStore) private currentUserProfileStore: CurrentUserProfileStore) {
    makeAutoObservable(this)

    this.updateEmailSeparator = this.updateEmailSeparator.bind(this)
    this.onUserSettingsUpdate = this.onUserSettingsUpdate.bind(this)
    this.updateDateFormat = this.updateDateFormat.bind(this)

    this.addUserSettingsUpdateListener()

    this.init()
  }

  get isAlertMessageActive(): boolean {
    return this.alertMessage.activation === 'True'
  }

  async init(): Promise<void> {
    const { settings } = await this.currentUserProfileStore.fetch()

    if (settings?.dateFormat) {
      this.dateFormat = settings.dateFormat
    }

    if (settings?.emailAddressSeparator) {
      this.emailSeparator = settings.emailAddressSeparator
    }

    if (settings?.alertMessage) {
      this.alertMessage = { ...this.alertMessage, ...settings.alertMessage }
    }
  }

  addUserSettingsUpdateListener(): void {
    socket.on('user.settings.users.updated', this.onUserSettingsUpdate)
  }

  removeUserSettingsUpdateListener(): void {
    socket.off('user.settings.users.updated', this.onUserSettingsUpdate)
  }

  setDateFormat(value: string): void {
    this.dateFormat = value

    this.debouncedDateFormat(value)
  }

  setEmailSeparator(value: string): void {
    this.emailSeparator = value

    this.debouncedEmailSeparator(value)
  }

  setAlertMessage<T extends keyof AlertMessageData>(key: T, data: AlertMessageData[T]): void {
    this.alertMessage[key] = data

    if (key === 'data') {
      this.debouncedAlertMessage()

      return
    }

    this.updateAlertMessage()
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

  updateAlertMessage(): void {
    this.updateUserSettings({ alertMessage: this.alertMessage })
  }

  resetToDefaults(): void {
    socket.emit('user.settings.reset')

    this.dateFormat = DEFAULT_DATE_FORMAT
    this.alertMessage = DEFAULT_ALERT_MESSAGE
    this.emailSeparator = DEFAULT_EMAIL_SEPARATOR

    this.updateUserSettings({
      dateFormat: DEFAULT_DATE_FORMAT,
      alertMessage: DEFAULT_ALERT_MESSAGE,
      emailAddressSeparator: DEFAULT_EMAIL_SEPARATOR,
    })
  }

  static checkedToText(checked: boolean): string {
    return checked === true ? 'True' : 'False'
  }

  private onUserSettingsUpdate({ user }: UserSettingsUpdateMessage): void {
    if (user.settings.alertMessage) {
      this.alertMessage = user.settings.alertMessage
    }
  }

  private debouncedAlertMessage = debounce(this.updateAlertMessage, this.debounceDelay)
  private debouncedDateFormat = debounce(this.updateDateFormat, this.debounceDelay)
  private debouncedEmailSeparator = debounce(this.updateEmailSeparator, this.debounceDelay)

  private updateUserSettings<T>(data: Record<string, T>): void {
    socket.emit('user.settings.update', data)
  }
}
