import { Link } from 'react-router'
import { Button } from '@vkontakte/vkui'
import { memo } from 'react'

import { getControlRoute } from '@/constants/route-paths'

import type { DeviceWithFields } from '@/types/device-with-fields.type'

type ProductCellProps = {
  product: DeviceWithFields['product']
  serial: DeviceWithFields['serial']
  isDisabled?: boolean
}

export const ProductCell = memo(({ product, serial, isDisabled = false }: ProductCellProps) => (
  <>
    {serial && (
      <Link to={getControlRoute(serial)}>
        <Button disabled={isDisabled} mode='link' size='m'>
          {product}
        </Button>
      </Link>
    )}
  </>
))
