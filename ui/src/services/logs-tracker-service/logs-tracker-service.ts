import { injectable } from 'inversify'
import { makeAutoObservable } from 'mobx'

import { socket } from '@/api/socket'
import { LogcatEntryMessage } from '@/types/logcat-entry-message.type'

import { debounce } from '@/lib/utils/debounce.util'

import type { DeviceLogs } from './types'

@injectable()
export class LogsTrackerService {
  private batchLogsSize = 30

  /* NOTE: Do not mutate this object to ensure stable references for React Table.
    For more details, see: https://tanstack.com/table/latest/docs/guide/data#give-data-a-stable-reference
  */
  logsByDeviceSerial: Record<string, DeviceLogs> = {}
  batchedLogs: LogcatEntryMessage[] = []
  maxLogsBuffer = 3000
  maxVisibleLogs = 100

  constructor() {
    makeAutoObservable(this, {
      batchedLogs: false,
    })

    this.onLogcatEntry = this.onLogcatEntry.bind(this)
    this.debouncedFlushLogs = debounce(this.flushLogs.bind(this), 100)

    socket.on('logcat.entry', this.onLogcatEntry)
  }

  initializeLogcat(serial: string): void {
    if (this.logsByDeviceSerial[serial]) {
      this.setLogcatStarted(serial, true)
    }

    if (!this.logsByDeviceSerial[serial]) {
      this.logsByDeviceSerial = {
        ...this.logsByDeviceSerial,
        [serial]: {
          logs: [],
          isLogcatStarted: true,
        },
      }
    }
  }

  turnOffLogcat(serial: string): void {
    this.setLogcatStarted(serial, false)
  }

  clearDeviceLogs(serial: string): void {
    this.logsByDeviceSerial = {
      ...this.logsByDeviceSerial,
      [serial]: {
        ...this.logsByDeviceSerial[serial],
        logs: [],
      },
    }
  }

  private onLogcatEntry(data: LogcatEntryMessage): void {
    this.batchedLogs.push(data)

    if (this.batchedLogs.length >= this.batchLogsSize) {
      this.flushLogs(data.serial)
    }

    this.debouncedFlushLogs(data.serial)
  }

  private debouncedFlushLogs: (serial: string) => void

  private flushLogs(serial: string): void {
    this.logsByDeviceSerial = {
      ...this.logsByDeviceSerial,
      [serial]: {
        ...this.logsByDeviceSerial[serial],
        logs: [...this.logsByDeviceSerial[serial].logs, ...this.batchedLogs],
      },
    }

    this.batchedLogs = []

    if (this.logsByDeviceSerial[serial].logs.length > this.maxLogsBuffer) {
      this.logsByDeviceSerial[serial].logs = this.logsByDeviceSerial[serial].logs.slice(-this.maxLogsBuffer)
    }
  }

  private setLogcatStarted(serial: string, isStarted: boolean): void {
    this.logsByDeviceSerial = {
      ...this.logsByDeviceSerial,
      [serial]: {
        ...this.logsByDeviceSerial[serial],
        isLogcatStarted: isStarted,
      },
    }
  }
}
