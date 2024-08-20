const syrup = require('@devicefarmer/stf-syrup')

const logger = require('../../../util/logger')
const wire = require('../../../wire')
const wireutil = require('../../../wire/util')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../../base-device/support/router'))
  .dependency(require('../../base-device/support/push'))
  .define(function(options, adb, router, push) {
    const log = logger.createLogger('device:plugins:reboot')

    router.on(wire.RebootMessage, function(channel) {
      let reply = wireutil.reply(options.serial)

      log.important('Rebooting')

      adb.getDevice(options.serial).reboot()
        .then(function() {
          push.send([
            channel
          , reply.okay()
          ])
        })
        .error(function(err) {
          log.error('Reboot failed', err.stack)
          push.send([
            channel
          , reply.fail(err.message)
          ])
        })
    })
  })
