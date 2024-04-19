var syrup = require('@devicefarmer/stf-syrup')

var logger = require('../../../util/logger')
var ChannelManager = require('../../../wire/channelmanager')

module.exports = syrup.serial()
  .define(function() {
    let log = logger.createLogger('device:support:channels')
    let channels = new ChannelManager()
    channels.on('timeout', function(channel) {
      log.info('Channel "%s" timed out', channel)
    })
    return channels
  })
