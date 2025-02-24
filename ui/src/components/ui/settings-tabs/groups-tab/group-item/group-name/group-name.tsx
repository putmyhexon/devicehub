import { useEffect, useState } from 'react'
import { Flex, Tappable } from '@vkontakte/vkui'
import { Icon16PenOutline } from '@vkontakte/icons'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { useUpdateGroup } from '@/lib/hooks/use-update-group.hook'

import { validateString } from './helpers'

import styles from './group-name.module.css'

import type { ChangeEvent, FormEvent } from 'react'

type GroupNameProps = {
  groupId?: string
  name?: string
}

export const GroupName = ({ groupId, name }: GroupNameProps) => {
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(name)
  const { mutate: updateGroup } = useUpdateGroup(groupId || '')

  const changeName = () => {
    if (error || editedName === name) {
      setIsEditing(false)
      setEditedName(name)
      setError('')

      return
    }

    updateGroup({ name: editedName })
    setIsEditing(false)
  }

  const onChangeEditedName = (event: ChangeEvent<HTMLInputElement>) => {
    setError('')

    if (!validateString(event.target.value)) {
      setError('Only latin letters, numbers, -, _, ., /, :, and spaces allowed (1-50 chars)')
    }

    setEditedName(event.target.value)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    changeName()
  }

  useEffect(() => {
    setEditedName(name)
  }, [name])

  return (
    <>
      <ConditionalRender conditions={[!isEditing]}>
        <Tappable
          activeMode='opacity'
          focusVisibleMode='outside'
          hoverMode='opacity'
          onClick={(event) => {
            event.stopPropagation()

            setIsEditing(true)
          }}
        >
          <Flex align='center' className={styles.name}>
            {name}
            <Icon16PenOutline className={styles.editIcon} height={14} width={14} />
          </Flex>
        </Tappable>
      </ConditionalRender>
      <ConditionalRender conditions={[isEditing]}>
        <form onSubmit={onSubmit}>
          <input
            className={styles.input}
            spellCheck={false}
            value={editedName}
            autoFocus
            onBlur={changeName}
            onChange={onChangeEditedName}
            onClick={(event) => event.stopPropagation()}
          />
          <ConditionalRender conditions={[!!error]}>
            <p className={styles.error}>{error}</p>
          </ConditionalRender>
        </form>
      </ConditionalRender>
    </>
  )
}
