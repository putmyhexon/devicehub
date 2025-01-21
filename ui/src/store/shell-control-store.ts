import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'inversify'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { DeviceControlStore } from './device-control-store'

@injectable()
export class ShellControlStore {
  command = ''
  shellResult = ''

  constructor(@inject(CONTAINER_IDS.deviceControlStore) private deviceControlStore: DeviceControlStore) {
    makeAutoObservable(this)
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

    this.clear()

    data.subscribeToProgress((_, result) => {
      if (result) {
        runInAction(() => {
          this.shellResult += result
        })
      }

      if (!result) {
        this.shellResult = 'No output'
      }
    })
  }
}
