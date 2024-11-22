import type { ReactNode } from 'react'

export type TabsContent = {
  id: string
  title: string
  before?: ReactNode
  ariaControls: string
  content: ReactNode
}
