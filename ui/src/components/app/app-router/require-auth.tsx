import { Outlet } from 'react-router'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { authStore } from '@/store/auth-store'

import { getAuthRoute } from '@/constants/route-paths'

export const RequireAuth = observer(() => {
  useEffect(() => {
    if (!authStore.isAuthed) {
      window.location.assign(getAuthRoute())
    }
  }, [authStore.isAuthed])

  return (
    <ConditionalRender conditions={[authStore.isAuthed]}>
      <Outlet />
    </ConditionalRender>
  )
})
