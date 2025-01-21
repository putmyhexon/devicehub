import { useInjection } from 'inversify-react'

import { OutputField } from '@/components/lib/output-field'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

export const RemoteDebugControl = () => {
  const deviceConnection = useInjection(CONTAINER_IDS.deviceConnection)

  return <OutputField text={deviceConnection.debugCommand} />
}
