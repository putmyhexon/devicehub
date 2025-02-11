import { Flex } from '@vkontakte/vkui'
import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { ResetSettings } from './reset-settings'
import { InterfaceSettings } from './interface-settings'
import { AlertMessageSettings } from './alert-message-settings'
import { DisplaySettings } from './display-settings/display-settings'

import styles from './general-tab.module.css'

export const GeneralTab = observer(() => {
  const currentUserProfileStore = useInjection(CONTAINER_IDS.currentUserProfileStore)

  return (
    <div className={styles.generalTabContainer}>
      <div className={styles.generalTab}>
        <Flex direction='column' gap='l' justify='space-between'>
          <InterfaceSettings />
          <DisplaySettings />
          <ResetSettings />
        </Flex>
        <ConditionalRender conditions={[currentUserProfileStore.isAdmin]}>
          <AlertMessageSettings className={styles.alertMessageSettings} />
        </ConditionalRender>
      </div>
    </div>
  )
})
