const syrup = require('@devicefarmer/stf-syrup')

const logger = require('../../../util/logger')
const wire = require('../../../wire')
const wireutil = require('../../../wire/util')

module.exports = syrup.serial()
  .dependency(require('../../base-device/support/push'))
  .dependency(require('./service'))
  .define(function(options, push, service) {
    const log = logger.createLogger('device:plugins:mobile-service')

    function updateMobileServices(data) {
      log.info('Updating mobile services list')
      push.send([
        wireutil.global
        , wireutil.envelope(new wire.GetServicesAvailabilityMessage(
          options.serial
          , data.hasGMS
          , data.hasHMS
        ))
      ])
    }

    function loadMobileServices() {
      log.info('Loading mobile services list')
      return service.getMobileServices()
        .then(updateMobileServices)
    }

    return loadMobileServices()
  })
