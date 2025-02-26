import { Link } from 'react-router'
import { Button } from '@vkontakte/vkui'
import { memo } from 'react'

import { getControlRoute } from '@/constants/route-paths'

import type { ListDevice } from '@/types/list-device.type'

type ProductCellProps = {
  product: ListDevice['product']
  serial: ListDevice['serial']
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
