import { OutputField } from '@/components/lib/output-field'

import { deviceConnection } from '@/store/device-connection'

export const RemoteDebugControl = () => <OutputField text={deviceConnection.debugCommand} />
