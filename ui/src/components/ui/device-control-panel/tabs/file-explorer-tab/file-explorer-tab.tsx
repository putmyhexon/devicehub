import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'
import { Button, Card, Div, Flex, IconButton, Input } from '@vkontakte/vkui'
import { Icon20HomeOutline, Icon20FolderSimpleArrowUpOutline, Icon24ChevronCompactRight } from '@vkontakte/icons'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { FileExplorerTable } from './file-explorer-table'

import styles from './file-explorer-tab.module.css'

import type { KeyboardEvent } from 'react'

export const FileExplorerTab = observer(() => {
  const fileExplorerService = useInjection(CONTAINER_IDS.fileExplorerService)

  const onPressEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fileExplorerService.enterDirectoryLocation()
    }
  }

  return (
    <Card className={styles.fileExplorerTab} mode='tint'>
      <Div>
        <Flex align='center' gap='m' justify='space-between' noWrap>
          <Flex noWrap>
            <Button
              appearance='neutral'
              before={<Icon20HomeOutline />}
              mode='tertiary'
              onClick={() => fileExplorerService.goHome()}
            />
            <Button
              appearance='neutral'
              before={<Icon20FolderSimpleArrowUpOutline />}
              mode='tertiary'
              onClick={() => fileExplorerService.upDirectory()}
            />
          </Flex>
          <Input
            beforeAlign='end'
            className={styles.input}
            value={fileExplorerService.currentPath}
            after={
              <IconButton
                hoverMode='opacity'
                label='list directory'
                onClick={() => fileExplorerService.enterDirectoryLocation()}
              >
                <Icon24ChevronCompactRight />
              </IconButton>
            }
            onChange={(event) => fileExplorerService.setCurrentPath(event.target.value)}
            onKeyDown={onPressEnter}
          />
        </Flex>
        <FileExplorerTable />
      </Div>
    </Card>
  )
})
