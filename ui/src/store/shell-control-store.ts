import { makeAutoObservable } from 'mobx'

import { serviceLocator } from '@/services/service-locator'

import { DeviceControlStore } from './device-control-store'

export class ShellControlStore {
  command = ''
  shellResult = ''

  private readonly deviceControlStore: DeviceControlStore

  constructor() {
    makeAutoObservable(this)

    this.deviceControlStore = serviceLocator.get<DeviceControlStore>(DeviceControlStore.name)
  }

  setCommand(command: string): void {
    this.command = command
  }

  clear(): void {
    this.command = ''
    this.shellResult = ''
  }

  runShellCommand(): void {
    const data = this.deviceControlStore.shell(this.command)

    data.subscribeToProgress((_, result) => {
      if (result) {
        this.shellResult = result
      }

      if (!result) {
        this.shellResult = 'No output'
      }
    })
  }
}
