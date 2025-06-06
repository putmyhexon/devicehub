import logger from './logger.js'

const log = logger.createLogger('util:device-auth')

/**
 * Validates if a user has access to control a specific device
 * @param {string} token - User JWT token
 * @param {string} deviceSerial - Device serial number
 * @param {string} apiUrl - API base URL (e.g., 'http://localhost:7106')
 * @returns {Promise<{authorized: boolean, user?: object, error?: string}>}
 */
async function validateDeviceAccess(token, deviceSerial, apiUrl) {
    try {
        const response = await fetch(`${apiUrl}/api/v1/devices/validate-access`, {
            method: 'POST'
            , headers: {
                'Content-Type': 'application/json'
                , Authorization: `Bearer ${token}`
            }
            , body: JSON.stringify({
                deviceSerial: deviceSerial
            })
        })

        const data = await response.json()

        if (response.ok && data?.success) {
            return {
                authorized: true
            }
        }
        else {
            return {
                authorized: false
                , error: data?.message || `HTTP ${response.status}`
            }
        }
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        log.error('Device access validation failed:', error.message)

        if (error.message.includes('fetch')) {
            return {
                authorized: false
                , error: 'API not reachable'
            }
        }
        else {
            return {
                authorized: false
                , error: 'Validation error'
            }
        }
    }
}

export default validateDeviceAccess
