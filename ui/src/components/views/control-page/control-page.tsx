import Split from 'react-split'

import { DeviceScreen } from '@/components/ui/device-screen'
import { DeviceControlPanel } from '@/components/ui/device-control-panel'

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
    <DeviceScreen />
    <DeviceControlPanel />
  </Split>
)
