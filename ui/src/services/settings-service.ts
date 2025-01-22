import { injectable } from 'inversify'

import { socket } from '@/api/socket'

@injectable()
export class SettingsService {
  updateUserSettings(data: Record<string, unknown>): void {
    socket.emit('user.settings.update', data)
  }

  setLastUsedDevice(value: string): void {
    this.updateUserSettings({ lastUsedDevice: value })
  }
}
