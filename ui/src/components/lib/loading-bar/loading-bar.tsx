import { Headline, Progress } from '@vkontakte/vkui'

import styles from './loading-bar.module.css'

type LoadingBarProps = {
  value: number
  status: string
}

export const LoadingBar = ({ value, status }: LoadingBarProps) => (
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
