import cn from 'classnames'
import { DisplayTitle } from '@vkontakte/vkui'

import styles from './marquee.module.css'

import type { ReactNode } from 'react'
import type { MarqueeVariant } from './types'

const MARQUEE_COLOR_MAP: Record<MarqueeVariant, string> = {
  ['Error']: styles.critical,
  ['Warn']: styles.warning,
  ['Info']: styles.information,
}

type MarqueeProps = {
  children: ReactNode
  variant: MarqueeVariant
}

export const Marquee = ({ children, variant }: MarqueeProps) => (
  <div className={cn(styles.marquee, MARQUEE_COLOR_MAP[variant])}>
    <DisplayTitle className={styles.text} level='3'>
      {children}
    </DisplayTitle>
    <DisplayTitle className={styles.text} level='3'>
      {children}
    </DisplayTitle>
  </div>
)
