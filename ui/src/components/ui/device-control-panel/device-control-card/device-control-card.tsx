import { useState } from 'react'
import { Button, Card, Div, Flex, Headline, Tooltip } from '@vkontakte/vkui'
import {
  Icon24Upload,
  Icon20BugOutline,
  Icon20HelpOutline,
  Icon20CopyOutline,
  Icon20GlobeOutline,
  Icon20DeleteOutline,
  Icon28SettingsOutline,
  Icon20AddSquareOutline,
  Icon28StopwatchOutline,
  Icon20ChevronRightOutline,
} from '@vkontakte/icons'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { DeviceControlCardAfter, DeviceControlCardIcon } from './types'

import styles from './device-control-card.module.css'

import type { ReactNode } from 'react'

const BEFORE_ICON_MAP = {
  [DeviceControlCardIcon.SETTINGS]: <Icon28SettingsOutline height={20} width={20} />,
  [DeviceControlCardIcon.UPLOAD]: <Icon24Upload height={20} width={20} />,
  [DeviceControlCardIcon.BUG]: <Icon20BugOutline />,
  [DeviceControlCardIcon.GLOBE]: <Icon20GlobeOutline />,
  [DeviceControlCardIcon.COPY]: <Icon20CopyOutline />,
  [DeviceControlCardIcon.SHELL]: <Icon20ChevronRightOutline />,
  [DeviceControlCardIcon.TIME]: <Icon28StopwatchOutline height={20} width={20} />,
}

const AFTER_BUTTON_ICON_MAP = {
  [DeviceControlCardAfter.ADD]: <Icon20AddSquareOutline />,
  [DeviceControlCardAfter.COPY]: <Icon20CopyOutline />,
  [DeviceControlCardAfter.CLEAR]: <Icon20DeleteOutline />,
}

type DeviceControlCardProps = {
  title: string
  children: ReactNode
  icon?: DeviceControlCardIcon
  after?: DeviceControlCardAfter
  afterTooltipText?: string
  helpTooltipText?: string
  onAfterButtonClick?: () => void
}

export const DeviceControlCard = ({
  title,
  children,
  icon,
  after,
  afterTooltipText,
  helpTooltipText,
  onAfterButtonClick,
}: DeviceControlCardProps) => {
  const [isAfterButtonTooltipShown, setIsAfterButtonTooltipShown] = useState(false)

  return (
    <Card className={styles.deviceControlCard} mode='tint'>
      <Div>
        <Flex align='center' className={styles.cardHeader} justify='space-between'>
          <Flex align='center'>
            {icon && BEFORE_ICON_MAP[icon]}
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
              <Button
                appearance='neutral'
                before={after && AFTER_BUTTON_ICON_MAP[after]}
                mode='tertiary'
                onClick={onAfterButtonClick}
              />
            </Tooltip>
          </Flex>
        </Flex>
        <div>{children}</div>
      </Div>
    </Card>
  )
}
