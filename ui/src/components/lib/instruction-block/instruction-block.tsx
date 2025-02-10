import { Button, Flex, FormStatus } from '@vkontakte/vkui'

import { OutputField } from '@/components/lib/output-field'
import { ConditionalRender } from '@/components/lib/conditional-render'

import styles from './instruction-block.module.css'

type InstructionBlockProps = {
  title: string
  copyableText: string
  onOkClick?: () => void
  isClosable?: boolean
}

export const InstructionBlock = ({ title, copyableText, onOkClick, isClosable = true }: InstructionBlockProps) => (
  <FormStatus className={styles.instructionBlock} mode='default' title={title}>
    <Flex className={styles.outputContainer} justify='space-between'>
      <OutputField className={styles.outputField} text={copyableText} />
      <ConditionalRender conditions={[isClosable]}>
        <Button appearance='overlay' className={styles.outputButton} mode='primary' size='m' onClick={onOkClick}>
          OK
        </Button>
      </ConditionalRender>
    </Flex>
  </FormStatus>
)
