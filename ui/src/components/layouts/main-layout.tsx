import { Outlet } from 'react-router'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'

import { Header } from '@/components/ui/header'
import { Marquee } from '@/components/lib/marquee'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import type { MarqueeVariant } from '@/components/lib/marquee'
import type { AlertMessageLevel } from '@/types/alert-message-level.type'

const ALERT_LEVEL_TO_MARQUEE_VARIANT_MAP: Record<AlertMessageLevel, MarqueeVariant> = {
  ['Critical']: 'Error',
  ['Information']: 'Info',
  ['Warning']: 'Warn',
}

export const MainLayout = observer(() => {
  const settingsService = useInjection(CONTAINER_IDS.settingsService)

  return (
    <>
      <Header />
      <ConditionalRender conditions={[settingsService.isAlertMessageActive]}>
        <Marquee variant={ALERT_LEVEL_TO_MARQUEE_VARIANT_MAP[settingsService.alertMessage.level]}>
          {settingsService.alertMessage.data}
        </Marquee>
      </ConditionalRender>
      <main className={cn('pageWrapper', { marqueeOffset: settingsService.isAlertMessageActive })}>
        <Outlet />
      </main>
    </>
  )
})
