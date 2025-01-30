import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useInjection } from 'inversify-react'
import { Flex, FormLayoutGroup, Placeholder, Separator, Spacing, Text } from '@vkontakte/vkui'
import {
  Icon28InboxOutline,
  Icon28ComputerOutline,
  Icon28SmartphoneOutline,
  Icon28ArrowRightOutline,
} from '@vkontakte/icons'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { PortForwardItem } from './port-forward-item'

import styles from './port-forwarding-control.module.css'

export const PortForwardingControl = observer(() => {
  const { t } = useTranslation()

  const portForwardingService = useInjection(CONTAINER_IDS.portForwardingService)

  return (
    <div className={styles.portForwardingControl}>
      <Flex align='center' justify='space-around'>
        <Flex align='center' direction='column' gap='l' justify='center'>
          <Icon28SmartphoneOutline />
          <Text>{t('Device')}</Text>
        </Flex>
        <Icon28ArrowRightOutline />
        <Flex align='center' direction='column' gap='l' justify='center'>
          <Icon28ComputerOutline />
          <Text>{t('Host')}</Text>
        </Flex>
      </Flex>
      <Spacing />
      <Separator appearance='primary-alpha' size='4xl' />
      <FormLayoutGroup mode='vertical'>
        {portForwardingService.portForwards.map((item) => (
          <PortForwardItem key={item.id} className={styles.portForwardItem} {...item} />
        ))}
      </FormLayoutGroup>
      <ConditionalRender conditions={[portForwardingService.isPortForwardsEmpty]}>
        <Placeholder className={styles.placeholder} icon={<Icon28InboxOutline />} noPadding>
          {t('Empty')}
        </Placeholder>
      </ConditionalRender>
    </div>
  )
})
