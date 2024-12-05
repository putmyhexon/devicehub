import { useState } from 'react'
import { Button, Card, Div, Flex, Headline, Tooltip } from '@vkontakte/vkui'
import { Icon20HelpOutline } from '@vkontakte/icons'

import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './device-control-card.module.css'

import type { ReactElement, ReactNode } from 'react'

type DeviceControlCardProps = {
  title: string
  children: ReactNode
  before?: ReactNode
  after?: ReactElement
  afterTooltipText?: string
  helpTooltipText?: string
}

export const DeviceControlCard = ({
  title,
  children,
  before,
  after,
  afterTooltipText,
  helpTooltipText,
}: DeviceControlCardProps) => {
  const [isAfterButtonTooltipShown, setIsAfterButtonTooltipShown] = useState(false)

  return (
    <Card className={styles.deviceControlCard} mode='tint'>
      <Div>
        <Flex align='center' className={styles.cardHeader} justify='space-between'>
          <Flex align='center'>
            {before}
            <Headline className={styles.cardTitle} level='1'>
              {title}
            </Headline>
          </Flex>
          <Flex align='center'>
            <ConditionalRender conditions={[!!helpTooltipText]}>
              <Tooltip appearance='accent' placement='left' text={helpTooltipText}>
                <Button appearance='neutral' before={<Icon20HelpOutline />} mode='tertiary' />
              </Tooltip>
            </ConditionalRender>
            <Tooltip
              appearance='accent'
              shown={!!afterTooltipText && isAfterButtonTooltipShown}
              text={afterTooltipText}
              onShownChange={setIsAfterButtonTooltipShown}
            >
              {after}
            </Tooltip>
          </Flex>
        </Flex>
        <div>{children}</div>
      </Div>
    </Card>
  )
}
