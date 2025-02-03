import cn from 'classnames'
import { Icon20HelpOutline } from '@vkontakte/icons'
import { Button, Card, Div, Flex, Headline, Separator, Tooltip } from '@vkontakte/vkui'

import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './device-control-card.module.css'

import type { ReactElement, ReactNode } from 'react'

type DeviceControlCardProps = {
  title: string
  children: ReactNode
  before?: ReactNode
  afterButtonIcon?: ReactElement
  onAfterButtonClick?: () => void
  afterTooltipText?: string
  helpTooltipText?: string
  className?: string
  separator?: boolean
}

export const DeviceControlCard = ({
  title,
  children,
  before,
  afterButtonIcon,
  onAfterButtonClick,
  afterTooltipText,
  helpTooltipText,
  className,
  separator = false,
}: DeviceControlCardProps) => (
  <Card className={cn(styles.deviceControlCard, className)} mode='tint'>
    <Div className={styles.cardContent}>
      <Flex align='center' className={styles.cardHeader} justify='space-between' noWrap>
        <Flex align='center' noWrap>
          {before}
          <Headline className={styles.cardTitle} level='1'>
            {title}
          </Headline>
        </Flex>
        <Flex align='center'>
          <ConditionalRender conditions={[!!helpTooltipText]}>
            <Tooltip appearance='accent' description={helpTooltipText} placement='left'>
              <Button appearance='neutral' aria-label='Help button' before={<Icon20HelpOutline />} mode='tertiary' />
            </Tooltip>
          </ConditionalRender>
          <ConditionalRender conditions={[!!onAfterButtonClick]}>
            <Tooltip appearance='accent' description={afterTooltipText}>
              <Button
                appearance='neutral'
                aria-label='Control action button'
                before={afterButtonIcon}
                mode='tertiary'
                onClick={onAfterButtonClick}
              />
            </Tooltip>
          </ConditionalRender>
        </Flex>
      </Flex>
      <ConditionalRender conditions={[separator]}>
        <Separator appearance='primary-alpha' className={styles.separator} />
      </ConditionalRender>
      <div>{children}</div>
    </Div>
  </Card>
)
