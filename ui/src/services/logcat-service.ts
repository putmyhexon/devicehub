import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { LogcatEntryMessage } from '@/types/logcat-entry-message.type'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { DeviceControlStore } from '@/store/device-control-store'
import { deviceConnectionRequired } from '@/config/inversify/decorators'

import { LogsTrackerService } from './logs-tracker-service/logs-tracker-service'

@injectable()
@deviceConnectionRequired()
export class LogcatService {
  tag = '*'
  priority = 2

  constructor(
    @inject(CONTAINER_IDS.deviceSerial) private serial: string,
    @inject(CONTAINER_IDS.deviceControlStore) private deviceControlStore: DeviceControlStore,
    @inject(CONTAINER_IDS.logsTrackerService) private logsTrackerService: LogsTrackerService
  ) {
    makeAutoObservable(this)
  }

  get deviceLogs(): LogcatEntryMessage[] {
    return this.logsTrackerService.logsByDeviceSerial[this.serial]?.logs ?? []
  }

  get visibleDeviceLogs(): LogcatEntryMessage[] {
    return this.deviceLogs.slice(-100) ?? []
  }

  get isDeviceLogsEmpty(): boolean {
    return this.deviceLogs.length === 0
  }

  get isDeviceLogcatStarted(): boolean {
    return this.logsTrackerService.logsByDeviceSerial[this.serial]?.isLogcatStarted ?? false
  }

  setPriority(priority: number): void {
    this.priority = priority
  }

  setTag(tag: string): void {
    this.tag = tag
  }

  clearLogs(): void {
    this.logsTrackerService.clearDeviceLogs(this.serial)
  }

  startLogcat(): void {
    this.logsTrackerService.initializeLogcat(this.serial)

    this.deviceControlStore.startLogcat({ priority: this.priority, tag: this.tag })
  }

  async stopLogcat(): Promise<void> {
    try {
      await this.deviceControlStore.stopLogcat().promise

      this.logsTrackerService.turnOffLogcat(this.serial)
    } catch (error) {
      console.error(error)
    }
  }
}
