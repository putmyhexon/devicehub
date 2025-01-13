import cn from 'classnames'

import styles from './output-area.module.css'

type OutputAreaProps = {
  text: string
  className?: string
}

export const OutputArea = ({ text, className }: OutputAreaProps) => (
  <pre className={cn(styles.outputArea, className)}>{text}</pre>
)
