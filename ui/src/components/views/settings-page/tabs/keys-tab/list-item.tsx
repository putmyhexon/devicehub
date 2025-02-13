import { Cell } from '@vkontakte/vkui'
import { observer } from 'mobx-react-lite'
import { Icon20KeyOutline } from '@vkontakte/icons'

import styles from './keys-tab.module.css'

type ListItemProps = {
  title: string
  subtitle?: string
  onRemove: () => void
}

export const ListItem = observer(({ title, subtitle, onRemove }: ListItemProps) => (
  <Cell
    before={<Icon20KeyOutline />}
    className={styles.listItem}
    mode='removable'
    subtitle={subtitle}
    onRemove={onRemove}
  >
    {title}
  </Cell>
))
