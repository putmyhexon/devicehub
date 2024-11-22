import { socket } from '@/api/socket'
import { TransactionService } from '@/services/core/transaction-service/transaction-service'

import type { Device } from '@/generated/types'

class ControlService {
  changeQuality(device: Device, quality: number): void {
    return this.sendOneWay(device, 'quality.change', {
      quality,
    })
  }

  rotate(device: Device, rotation: number, lock?: boolean): void {
    return this.sendOneWay(device, 'display.rotate', {
      rotation,
      lock,
    })
  }

  startRemoteConnect(device: Device): Promise<unknown> {
    return this.sendTwoWay(device, 'connect.start')
  }

  private sendOneWay<T>(device: Device, action: string, data?: T): void {
    socket.emit(action, device.channel, data)
  }

  private sendTwoWay<T>(device: Device, action: string, data?: T): Promise<unknown> {
    const transaction = new TransactionService()
    const { channel: transactionChannel, promise: transactionEndPromise } = transaction.initializeTransaction()

    const platformSpecificAction = device.ios ? `${action}Ios` : action

    socket.emit(platformSpecificAction, device.channel, transactionChannel, data)

    return transactionEndPromise
  }
}

export const controlService = new ControlService()
