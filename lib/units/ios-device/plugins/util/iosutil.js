import logger from '../../../../util/logger.js'
import bluebird from 'bluebird'
const {Promise} = bluebird
const log = logger.createLogger('iosutil')
let iosutil = {
    asciiparser: function(key) {
        switch (key) {
        case 'tab':
            return '\x09'
        case 'enter':
            return '\r'
        case 'del':
            return '\x08'
            // Disable keys (otherwise it sends the first character of key string on default case)
        case 'dpad_left':
            return '\v'
        case 'dpad_up':
            return '\0'
        case 'dpad_right':
            return '\f'
        case 'dpad_down':
            return '\x18'
        case 'caps_lock':
        case 'escape':
        case 'home':
            return null
        default:
            return key
        }
    }
    , degreesToOrientation: function(degree) {
        switch (degree) {
        case 0:
            return 'PORTRAIT'
        case 90:
            return 'LANDSCAPE'
        case 180:
            return 'UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN'
        case 270:
            return 'UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT'
        }
    }
    , orientationToDegrees: function(orientation) {
        switch (orientation) {
        case 'PORTRAIT':
            return 0
        case 'LANDSCAPE':
            return 90
        case 'UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN':
            return 180
        case 'UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT':
            return 270
        }
    }
    , pressButton: function(key) {
        switch (key) {
        case 'settings':
            if (this.deviceType === 'Apple TV') {
                return this.appActivate('com.apple.TVSettings')
            }
            return this.appActivate('com.apple.Preferences')
        case 'store':
            if (this.deviceType === 'Apple TV') {
                return this.appActivate('com.apple.TVAppStore')
            }
            return this.appActivate('com.apple.AppStore')
        case 'volume_up':
            return this.pressButton('volumeUp')
        case 'volume_down':
            return this.pressButton('volumeDown')
        case 'power':
            return this.pressPower()
        case 'camera':
            return this.appActivate('com.apple.camera')
        case 'search':
            if (this.deviceType === 'Apple TV') {
                return this.appActivate('com.apple.TVSearch')
            }
            return this.appActivate('com.apple.mobilesafari')
        case 'finder':
            return this.appActivate('com.apple.findmy')
        case 'home':
            return this.homeBtn()
        case 'mute': {
            let i
            for (i = 0; i < 16; i++) {
                Promise.delay(1000).then(() => {
                    this.pressButton('volumeDown')
                })
            }
            return true
        }
        case 'switch_charset': {
            return this.switchCharset()
        }
        // Media button requests in case there's future WDA compatibility
        case 'media_play_pause':
            return log.error('Non-existent button in WDA')
        case 'media_stop':
            return log.error('Non-existent button in WDA')
        case 'media_next':
            return log.error('Non-existent button in WDA')
        case 'media_previous':
            return log.error('Non-existent button in WDA')
        case 'media_fast_forward':
            return log.error('Non-existent button in WDA')
        case 'media_rewind':
            return log.error('Non-existent button in WDA')
        default:
            return this.pressButton(key)
        }
    }
    , swipe: function(orientation, params, deviceSize) {
        switch (orientation) {
        case 'PORTRAIT':
            return {
                fromX: params.fromX * deviceSize.width
                , fromY: params.fromY * deviceSize.height
                , toX: params.toX * deviceSize.width
                , toY: params.toY * deviceSize.height
                , duration: params.duration
            }
        case 'LANDSCAPE':
            return {
                fromX: params.fromX * deviceSize.width
                , fromY: params.fromY * deviceSize.height
                , toX: params.toX * deviceSize.width
                , toY: params.toY * deviceSize.height
                , duration: params.duration
            }
        default:
            return {
                fromX: params.fromX * deviceSize.width
                , fromY: params.fromY * deviceSize.height
                , toX: params.toX * deviceSize.width
                , toY: params.toY * deviceSize.height
                , duration: params.duration
            }
        }
    }
    , getUri: function(host, port) {
        return `http://${host}:${port}`
    }
    , batteryState: function(state) {
        switch (state) {
        case 0:
            return 'full'
        case 1:
            return 'unplugged'
        case 2:
            return 'charging'
        case 3:
            return 'full'
        default:
            break
        }
    }
    , batteryLevel: function(level) {
        switch (level) {
        case -1:
            return 100
        default:
            return parseInt(level * 100, 10)
        }
    }
    , getModelName: function(identifier) {
        const deviceList = {
            // iPhones
            'iPhone1,1': 'iPhone'
            , 'iPhone1,2': 'iPhone 3G'
            , 'iPhone2,1': 'iPhone 3GS'
            , 'iPhone3,1': 'iPhone 4'
            , 'iPhone3,2': 'iPhone 4'
            , 'iPhone3,3': 'iPhone 4'
            , 'iPhone4,1': 'iPhone 4S'
            , 'iPhone5,1': 'iPhone 5'
            , 'iPhone5,2': 'iPhone 5'
            , 'iPhone5,3': 'iPhone 5c'
            , 'iPhone5,4': 'iPhone 5c'
            , 'iPhone6,1': 'iPhone 5s'
            , 'iPhone6,2': 'iPhone 5s'
            , 'iPhone7,2': 'iPhone 6'
            , 'iPhone7,1': 'iPhone 6 Plus'
            , 'iPhone8,1': 'iPhone 6s'
            , 'iPhone8,2': 'iPhone 6s Plus'
            , 'iPhone8,4': 'iPhone SE (1st generation)'
            , 'iPhone9,1': 'iPhone 7'
            , 'iPhone9,3': 'iPhone 7'
            , 'iPhone9,2': 'iPhone 7 Plus'
            , 'iPhone9,4': 'iPhone 7 Plus'
            , 'iPhone10,1': 'iPhone 8'
            , 'iPhone10,4': 'iPhone 8'
            , 'iPhone10,2': 'iPhone 8 Plus'
            , 'iPhone10,5': 'iPhone 8 Plus'
            , 'iPhone10,3': 'iPhone X'
            , 'iPhone10,6': 'iPhone X'
            , 'iPhone11,8': 'iPhone XR'
            , 'iPhone11,2': 'iPhone XS'
            , 'iPhone11,6': 'iPhone XS Max'
            , 'iPhone11,4': 'iPhone XS Max'
            , 'iPhone12,1': 'iPhone 11'
            , 'iPhone12,3': 'iPhone 11 Pro'
            , 'iPhone12,5': 'iPhone 11 Pro Max'
            , 'iPhone12,8': 'iPhone SE (2nd generation)'
            , 'iPhone13,1': 'iPhone 12 mini'
            , 'iPhone13,2': 'iPhone 12'
            , 'iPhone13,3': 'iPhone 12 Pro'
            , 'iPhone13,4': 'iPhone 12 Pro Max'
            , 'iPhone14,4': 'iPhone 13 mini'
            , 'iPhone14,5': 'iPhone 13'
            , 'iPhone14,2': 'iPhone 13 Pro'
            , 'iPhone14,3': 'iPhone 13 Pro Max'
            , 'iPhone14,6': 'iPhone SE (3rd generation)'
            , 'iPhone15,2': 'iPhone 14 Pro'
            , 'iPhone15,3': 'iPhone 14 Pro Max'
            , 'iPhone15,4': 'iPhone 14'
            , 'iPhone15,5': 'iPhone 14 Plus'
            , 'iPhone16,1': 'iPhone 15'
            , 'iPhone16,2': 'iPhone 15 Pro'
            , 'iPhone16,3': 'iPhone 15 Pro Max'
            , 'iPhone16,4': 'iPhone 15 Plus'

            // iPads
            , 'iPad1,1': 'iPad (1st generation)'
            , 'iPad2,1': 'iPad 2'
            , 'iPad2,2': 'iPad 2'
            , 'iPad2,3': 'iPad 2'
            , 'iPad2,4': 'iPad 2'
            , 'iPad3,1': 'iPad (3rd generation)'
            , 'iPad3,2': 'iPad (3rd generation)'
            , 'iPad3,3': 'iPad (3rd generation)'
            , 'iPad3,4': 'iPad (4th generation)'
            , 'iPad3,5': 'iPad (4th generation)'
            , 'iPad3,6': 'iPad (4th generation)'
            , 'iPad4,1': 'iPad Air (1st generation)'
            , 'iPad4,2': 'iPad Air (1st generation)'
            , 'iPad4,3': 'iPad Air (1st generation)'
            , 'iPad5,3': 'iPad Air 2'
            , 'iPad5,4': 'iPad Air 2'
            , 'iPad6,11': 'iPad (5th generation)'
            , 'iPad6,12': 'iPad (5th generation)'
            , 'iPad7,5': 'iPad (6th generation)'
            , 'iPad7,6': 'iPad (6th generation)'
            , 'iPad7,11': 'iPad (7th generation)'
            , 'iPad7,12': 'iPad (7th generation)'
            , 'iPad8,1': 'iPad Pro 11-inch (1st generation)'
            , 'iPad8,2': 'iPad Pro 11-inch (1st generation)'
            , 'iPad8,3': 'iPad Pro 11-inch (1st generation)'
            , 'iPad8,4': 'iPad Pro 11-inch (1st generation)'
            , 'iPad8,5': 'iPad Pro 12.9-inch (3rd generation)'
            , 'iPad8,6': 'iPad Pro 12.9-inch (3rd generation)'
            , 'iPad8,7': 'iPad Pro 12.9-inch (3rd generation)'
            , 'iPad8,8': 'iPad Pro 12.9-inch (3rd generation)'
            , 'iPad11,1': 'iPad mini (5th generation)'
            , 'iPad11,2': 'iPad mini (5th generation)'
            , 'iPad11,3': 'iPad Air (3rd generation)'
            , 'iPad11,4': 'iPad Air (3rd generation)'
            , 'iPad11,6': 'iPad (8th generation)'
            , 'iPad11,7': 'iPad (8th generation)'
            , 'iPad12,1': 'iPad (9th generation)'
            , 'iPad12,2': 'iPad (9th generation)'
            , 'iPad13,1': 'iPad Air (4th generation)'
            , 'iPad13,2': 'iPad Air (4th generation)'
            , 'iPad13,4': 'iPad Pro 11-inch (3rd generation)'
            , 'iPad13,5': 'iPad Pro 11-inch (3rd generation)'
            , 'iPad13,6': 'iPad Pro 11-inch (3rd generation)'
            , 'iPad13,7': 'iPad Pro 11-inch (3rd generation)'
            , 'iPad13,8': 'iPad Pro 12.9-inch (5th generation)'
            , 'iPad13,9': 'iPad Pro 12.9-inch (5th generation)'
            , 'iPad13,10': 'iPad Pro 12.9-inch (5th generation)'
            , 'iPad13,11': 'iPad Pro 12.9-inch (5th generation)'
            , 'iPad14,1': 'iPad mini (6th generation)'
            , 'iPad14,2': 'iPad mini (6th generation)'
            , 'iPad14,3': 'iPad Air (5th generation)'
            , 'iPad14,4': 'iPad Air (5th generation)'
            // Apple TVs
            , 'AppleTV1,1': 'Apple TV (1st generation)'
            , 'AppleTV2,1': 'Apple TV (2nd generation)'
            , 'AppleTV3,1': 'Apple TV (3rd generation)'
            , 'AppleTV3,2': 'Apple TV (3rd generation)'
            , 'AppleTV5,3': 'Apple TV HD (4th generation)'
            , 'AppleTV6,2': 'Apple TV 4K (1st generation)'
            , 'AppleTV11,1': 'Apple TV 4K (2nd generation)'
            , 'AppleTV14,1': 'Apple TV 4K (3rd generation)'
        }
        return deviceList[identifier] || identifier
    }
}
export default iosutil
