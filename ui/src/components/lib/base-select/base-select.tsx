import { NativeSelect } from '@vkontakte/vkui'

import styles from './base-select.module.css'

import type { SelectOption } from './types'

type BaseSelectProps<T> = {
  value: T
  onChange: (value: string) => void
  options: SelectOption<T>[]
}

export const BaseSelect = <T extends string | number | undefined>({ value, onChange, options }: BaseSelectProps<T>) => (
  <NativeSelect
    className={styles.baseSelect}
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
