import cn from 'classnames'
import { Icon20RefreshOutline } from '@vkontakte/icons'
import { EllipsisText, Flex, IconButton, Tooltip } from '@vkontakte/vkui'

import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './output-field.module.css'

type OutputFieldProps = {
  text: string
  tooltipText?: string
  afterButtonClick?: () => void
}

export const OutputField = ({ text, tooltipText, afterButtonClick }: OutputFieldProps) => (
  <div className={styles.outputField}>
    <Flex align='center' className={styles.flexContainer} justify='space-between' noWrap>
      <EllipsisText className={cn({ [styles.text]: text })}>{text}</EllipsisText>
      <ConditionalRender conditions={[!!afterButtonClick]}>
        <Tooltip appearance='accent' description={tooltipText}>
          <IconButton
            borderRadiusMode='inherit'
            className={styles.afterButton}
            hoverMode='opacity'
            label='after output button'
            onClick={afterButtonClick}
          >
            <Icon20RefreshOutline />
          </IconButton>
        </Tooltip>
      </ConditionalRender>
    </Flex>
  </div>
)
