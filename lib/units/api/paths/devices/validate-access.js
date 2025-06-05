// devices

import {validateDeviceAccess} from '../../controllers/devices.js'

export function post(req, res) {
    return validateDeviceAccess(req, res)
}
