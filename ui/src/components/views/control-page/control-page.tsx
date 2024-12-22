import Split from 'react-split'

import { Device } from '@/components/ui/device'
import { DeviceControlPanel } from '@/components/ui/device-control-panel'

import { DeviceSerialProvider } from './device-serial-provider'

import styles from './control-page.module.css'

export const ControlPage = () => (
  <Split
    className={styles.split}
    direction='horizontal'
    gutterSize={4}
    minSize={[200, 0]}
    sizes={[30, 70]}
    snapOffset={10}
  >
    <DeviceSerialProvider>
      <Device />
      <DeviceControlPanel />
    </DeviceSerialProvider>
  </Split>
)
