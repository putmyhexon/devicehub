// devices

import {useDeviceByUser} from '../../../controllers/devices.js'

export function post(req, res, next) {
    return useDeviceByUser(req, res, next)
}


