import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'inversify'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'
import { deviceConnectionRequired } from '@/config/inversify/decorators'

import { DeviceControlStore } from './device-control-store'

@injectable()
@deviceConnectionRequired()
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

  async runShellCommand(): Promise<void> {
    const shellResult = await this.deviceControlStore.shell(this.command)

    this.clear()

    shellResult.subscribeToProgress((_, result) => {
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
