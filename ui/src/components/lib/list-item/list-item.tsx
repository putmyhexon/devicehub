import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Cell, Checkbox } from '@vkontakte/vkui'

import { WarningModal } from '@/components/ui/modals'
import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './list-item.module.css'

import type { ChangeEvent, ReactNode } from 'react'

type ListItemProps = {
  title: ReactNode
  subtitle?: ReactNode
  extraSubtitle?: ReactNode
  indicator?: ReactNode
  after?: ReactNode
  modalDescription?: string
  isRemoveDisabled?: boolean
  isNeedConfirmRemove?: boolean
  isOpenable?: boolean
  isSelected?: boolean
  onIsSelectedChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove?: () => void
  children?: ReactNode
}

export const ListItem = observer(
  ({
    title,
    subtitle,
    extraSubtitle,
    indicator,
    after,
    isSelected,
    isNeedConfirmRemove,
    isRemoveDisabled,
    modalDescription,
    onIsSelectedChange,
    onRemove,
    children,
    isOpenable = true,
  }: ListItemProps) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

    const onRemoveClick = () => {
      if (isRemoveDisabled) return

      if (isNeedConfirmRemove) {
        setIsConfirmationOpen(true)

        return
      }

      onRemove?.()
    }

    return (
      <div className={styles.listItem}>
        <Cell
          after={after}
          before={<Checkbox checked={isSelected} onChange={onIsSelectedChange} />}
          extraSubtitle={extraSubtitle}
          indicator={indicator}
          mode='removable'
          subtitle={subtitle}
          hasActive
          hasHover
          multiline
          onClick={isOpenable ? () => setIsOpen((prev) => !prev) : undefined}
          onRemove={onRemoveClick}
        >
          {title}
        </Cell>
        <ConditionalRender conditions={[isOpen]}>{children}</ConditionalRender>
        <WarningModal
          description={modalDescription}
          isOpen={isConfirmationOpen}
          title={t('Warning')}
          onClose={() => setIsConfirmationOpen(false)}
          onOk={async () => {
            onRemove?.()
          }}
        />
      </div>
    )
  }
)
