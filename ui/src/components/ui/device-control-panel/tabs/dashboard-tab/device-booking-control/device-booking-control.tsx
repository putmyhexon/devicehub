import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react-lite'
import { MiniInfoCell } from '@vkontakte/vkui'
import { useInjection } from 'inversify-react'

import { dateToFormattedString } from '@/lib/utils/date-to-formatted-string.util'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

export const DeviceBookingControl = observer(() => {
  const { t } = useTranslation()

  const bookingService = useInjection(CONTAINER_IDS.bookingService)

  return (
    <MiniInfoCell>
      {t('Booked before')}
      {': '}
      <time>{dateToFormattedString({ value: bookingService.bookedBeforeTime, onlyTime: true })}</time>
    </MiniInfoCell>
  )
})
