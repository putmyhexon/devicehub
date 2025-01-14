import type { Manifest } from '@/types/manifest.type'

export type TransactionDoneListenerMessage = {
  body: unknown | null
  data: string
  seq: number
  source: string
  success: boolean
}

export type TransactionProgressListenerMessage = {
  data: string
  progress: number
  seq: number
  source: string
}

export type ProgressFn = (progress: number, data: string) => void

export type InitializeTransactionReturn = {
  channel: string
  promise: Promise<unknown>
  abort: (reason?: string) => void
  subscribeToProgress: (progressFn: ProgressFn) => () => void
}

export type InstallOptions = {
  href: string
  manifest: Manifest
  launch: boolean
}
