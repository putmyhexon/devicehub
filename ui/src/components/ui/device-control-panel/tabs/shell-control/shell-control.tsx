import { IconButton, Input } from '@vkontakte/vkui'
import { Icon20Play } from '@vkontakte/icons'
import { observer } from 'mobx-react-lite'

import { OutputLogArea } from '@/components/lib/output-log-area'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { useServiceLocator } from '@/lib/hooks/use-service-locator.hook'
import { ShellControlStore } from '@/store/shell-control-store'

import styles from './shell-control.module.css'

export const ShellControl = observer(() => {
  const shellControlStore = useServiceLocator<ShellControlStore>(ShellControlStore.name)

  return (
    <>
      <Input
        value={shellControlStore?.command || ''}
        after={
          <IconButton
            disabled={!shellControlStore?.command}
            label='run shell command'
            onClick={() => shellControlStore?.runShellCommand()}
          >
            <Icon20Play />
          </IconButton>
        }
        onChange={(event) => shellControlStore?.setCommand(event.target.value)}
      />
      <ConditionalRender conditions={[!!shellControlStore?.shellResult]}>
        <OutputLogArea className={styles.shellResult} text={shellControlStore?.shellResult || ''} />
      </ConditionalRender>
    </>
  )
})
