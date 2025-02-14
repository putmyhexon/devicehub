import { Outlet } from 'react-router'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'

import { Header } from '@/components/ui/header'
import { AlertMarquee } from '@/components/ui/alert-marquee'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

export const MainLayout = observer(() => {
  const settingsService = useInjection(CONTAINER_IDS.settingsService)

  return (
    <>
      <Header />
      <AlertMarquee />
      <main className={cn('pageWrapper', { marqueeOffset: settingsService.isAlertMessageActive })}>
        <Outlet />
      </main>
    </>
  )
})
