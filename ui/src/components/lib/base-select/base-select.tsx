import cn from 'classnames'
import { NativeSelect } from '@vkontakte/vkui'

import styles from './base-select.module.css'

import type { SelectOption } from './types'

type BaseSelectProps<T> = {
  value: T
  onChange: (value: string) => void
  options: SelectOption<T>[]
  selectType?: 'default' | 'plain' | 'accent'
  stretched?: boolean
}

export const BaseSelect = <T extends string | number | undefined>({
  value,
  onChange,
  options,
  selectType = 'default',
  stretched = true,
}: BaseSelectProps<T>) => (
  <NativeSelect
    className={cn({ [styles.compact]: !stretched })}
    selectType={selectType}
    value={value}
    onChange={(event) => {
      onChange(event.target.value)
    }}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.name}
      </option>
    ))}
  </NativeSelect>
)
