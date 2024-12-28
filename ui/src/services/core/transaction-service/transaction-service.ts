import { makeAutoObservable } from 'mobx'

import { socket } from '@/api/socket'

import { generateTransactionSocketChannel } from '@/lib/utils/generate-transaction-socket-channel'

import type {
  ProgressFn,
  InitializeTransactionReturn,
  TransactionDoneListenerMessage,
  TransactionProgressListenerMessage,
} from './types'

export class TransactionService {
  private channel = ''
  private abortController
  private promise
  private progressFn: ProgressFn | null = null

  constructor() {
    makeAutoObservable(this)

    this.promise = Promise.withResolvers()
    this.abortController = new AbortController()
    this.transactionDoneListener = this.transactionDoneListener.bind(this)
    this.transactionProgressListener = this.transactionProgressListener.bind(this)
  }

  subscribeToProgress(progressFn: ProgressFn) {
    this.progressFn = progressFn

    return (): void => {
      this.progressFn = null
    }
  }

  createChannel(): void {
    this.channel = generateTransactionSocketChannel()
  }

  initializeTransaction(): InitializeTransactionReturn {
    this.addTransactionAbortListener()
    this.createChannel()

    socket.on('tx.done', this.transactionDoneListener)
    socket.on('tx.progress', this.transactionProgressListener)

    return {
      channel: this.channel,
      promise: this.promise.promise,
      subscribeToProgress: this.subscribeToProgress.bind(this),
      abort: (reason) => this.abortController.abort(reason),
    }
  }

  cleanUpTransaction(): void {
    socket.off('tx.done', this.transactionDoneListener)
    socket.emit('tx.cleanup', this.channel)
  }

  private addTransactionAbortListener(): void {
    this.abortController.signal.addEventListener(
      'abort',
      () => {
        this.cleanUpTransaction()
        this.promise.reject(new Error('Transaction aborted', { cause: this.abortController.signal.reason }))
      },
      { once: true }
    )
  }

  private transactionProgressListener(incomingChannel: string, message: TransactionProgressListenerMessage): void {
    if (incomingChannel !== this.channel) return

    this.progressFn?.(message.progress, message.data)
  }

  private transactionDoneListener(incomingChannel: string, message: TransactionDoneListenerMessage): void {
    if (incomingChannel !== this.channel) return

    if (message.success && message.data) {
      this.promise.resolve(message.data)
    }

    if (message.success && !message.data) {
      this.promise.resolve(true)
    }

    if (!message.success) {
      this.promise.reject(new Error('Failed to complete transaction', { cause: message.data }))
    }

    this.cleanUpTransaction()
  }
}
