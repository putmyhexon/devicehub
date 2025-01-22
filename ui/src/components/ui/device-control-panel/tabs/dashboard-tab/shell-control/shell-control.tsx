import { IconButton, Input } from '@vkontakte/vkui'
import { useInjection } from 'inversify-react'
import { Icon20Play } from '@vkontakte/icons'
import { observer } from 'mobx-react-lite'

import { OutputLogArea } from '@/components/lib/output-log-area'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import styles from './shell-control.module.css'

import type { KeyboardEvent } from 'react'

export const ShellControl = observer(() => {
  const shellControlStore = useInjection(CONTAINER_IDS.shellControlStore)

  const onPressEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      shellControlStore.runShellCommand()
    }
  }

  return (
    <>
      <Input
        value={shellControlStore.command}
        after={
          <IconButton
            disabled={!shellControlStore.command}
            label='run shell command'
            onClick={() => shellControlStore.runShellCommand()}
          >
            <Icon20Play />
          </IconButton>
        }
        onChange={(event) => shellControlStore.setCommand(event.target.value)}
        onKeyDown={onPressEnter}
      />
      <ConditionalRender conditions={[!!shellControlStore.shellResult]}>
        <OutputLogArea className={styles.shellResult} text={shellControlStore.shellResult} />
      </ConditionalRender>
    </>
  )
})
