const syrup = require('@devicefarmer/stf-syrup')

const adbkit = require('@devicefarmer/adbkit')

const logger = require('../../../util/logger')
const promiseutil = require('../../../util/promiseutil')

module.exports = syrup.serial()
  .define(function(options) {
    var log = logger.createLogger('device:support:adb')
    var adb = adbkit.Adb.createClient({
      host: options.adbHost
    , port: options.adbPort
    })
    adb.Keycode = adbkit.KeyCodes

    function ensureBootComplete() {
      return promiseutil.periodicNotify(
          adb.getDevice(options.serial).waitBootComplete()
        , 1000
        )
        .progressed(function() {
          log.info('Waiting for boot to complete')
        })
        .timeout(options.bootCompleteTimeout)
    }

    return ensureBootComplete()
      .return(adb)
  })
