import { Headline, Progress } from '@vkontakte/vkui'

import styles from './progress-bar.module.css'

type ProgressBarProps = {
  value: number
  status: string
}

export const ProgressBar = ({ value, status }: ProgressBarProps) => (
  <>
    <Progress height={10} value={value} />
    <Headline className={styles.status} level='1'>
      <span>
        {status} ({value}%)
      </span>
      <span className={styles.loader}>...</span>
    </Headline>
  </>
)
