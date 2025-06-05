import axios from 'axios'
import logger from './logger.js'

const log = logger.createLogger('util:device-auth')

/**
 * Validates if a user has access to control a specific device
 * @param {string} token - User JWT token
 * @param {string} deviceSerial - Device serial number
 * @param {string} apiUrl - API base URL (e.g., 'http://localhost:7106')
 * @returns {Promise<{authorized: boolean, user?: object, error?: string}>}
 */
export async function validateDeviceAccess(token, deviceSerial, apiUrl) {
    try {
        const response = await axios.post(`${apiUrl}/api/v1/devices/validate-access`, {
            deviceSerial: deviceSerial,
            token: token
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            timeout: 5000
        })

        if (response.data.success) {
            return {
                authorized: true,
                user: response.data.user
            }
        }
        else {
            return {
                authorized: false,
                error: response.data.message || 'Access denied'
            }
        }
    }
    catch (error) {
        log.error('Device access validation failed:', error.message)
        
        if (error.response) {
            return {
                authorized: false,
                error: error.response.data?.message || `HTTP ${error.response.status}`
            }
        }
        else if (error.request) {
            return {
                authorized: false,
                error: 'API not reachable'
            }
        }
        else {
            return {
                authorized: false,
                error: 'Validation error'
            }
        }
    }
}

export default {
    validateDeviceAccess
} 