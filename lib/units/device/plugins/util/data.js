const syrup = require('@devicefarmer/stf-syrup')
const deviceData = require('@devicefarmer/stf-device-db')

const logger = require('../../../../util/logger')

module.exports = syrup.serial()
  .dependency(require('./identity'))
  .define(function(options, identity) {
    const log = logger.createLogger('device:plugins:data')

    function find() {
      let data = deviceData.find(identity)
      if (!data) {
        log.warn('Unable to find device data - ', identity.model)
      }
      return data
    }

    return find()
  })
