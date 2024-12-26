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
  afterButtonIcon?: ReactElement
  onAfterButtonClick?: () => void
  afterTooltipText?: string
  helpTooltipText?: string
}

export const DeviceControlCard = ({
  title,
  children,
  before,
  afterButtonIcon,
  onAfterButtonClick,
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
              <Tooltip appearance='accent' description={helpTooltipText} placement='left'>
                <Button appearance='neutral' before={<Icon20HelpOutline />} mode='tertiary' />
              </Tooltip>
            </ConditionalRender>
            <Tooltip
              appearance='accent'
              description={afterTooltipText}
              shown={!!afterTooltipText && isAfterButtonTooltipShown}
              onShownChange={setIsAfterButtonTooltipShown}
            >
              <Button appearance='neutral' before={afterButtonIcon} mode='tertiary' onClick={onAfterButtonClick} />
            </Tooltip>
          </Flex>
        </Flex>
        <div>{children}</div>
      </Div>
    </Card>
  )
}
