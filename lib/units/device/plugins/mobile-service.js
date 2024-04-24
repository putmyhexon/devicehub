let syrup = require('@devicefarmer/stf-syrup')

let logger = require('../../../util/logger')
let wire = require('../../../wire')
let wireutil = require('../../../wire/util')

module.exports = syrup.serial()
  .dependency(require('../support/push'))
  .dependency(require('./service'))
  .define(function(options, push, service) {
    let log = logger.createLogger('device:plugins:mobile-service')

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
