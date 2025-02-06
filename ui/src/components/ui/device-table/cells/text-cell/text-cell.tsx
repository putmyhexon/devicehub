import { memo } from 'react'
import { Tappable, EllipsisText } from '@vkontakte/vkui'

import styles from './text-cell.module.css'

type TextCellProps = {
  textValue?: string | null
}

export const TextCell = memo(({ textValue }: TextCellProps) => {
  const onCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      {textValue && (
        <Tappable className={styles.tappable} hasHover={false} onClick={() => onCopyText(textValue)}>
          <EllipsisText maxLines={3} maxWidth={200}>
            {textValue}
          </EllipsisText>
        </Tappable>
      )}
    </>
  )
})
