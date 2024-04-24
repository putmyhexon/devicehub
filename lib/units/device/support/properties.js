var syrup = require('@devicefarmer/stf-syrup')

var logger = require('../../../util/logger')
const streamutil = require('../../../util/streamutil')

module.exports = syrup.serial()
  .dependency(require('./adb'))
  .define(function(options, adb) {
    const log = logger.createLogger('device:support:properties')

    function load() {
      log.info('Loading properties')
      return adb.getProperties(options.serial)
        .timeout(10000)
        .then((props) => {
          let sdk = props['ro.build.version.sdk']
          let command
          if (sdk >= 24) {
            command = "ip addr show wlan0  | grep 'link/ether '| cut -d' ' -f6 | xargs echo mac_address:"
          }
          else {
            command = 'cat /sys/class/net/wlan0/address | xargs echo mac_address:'
          }
          return adb.shell(options.serial,
            command)
            .timeout(15000)
            .then((out) => {
              return streamutil.findLine(out, (/^mac_address:/))
                .timeout(15000)
                .then(function(line) {
                  let splitedLine = line.split('mac_address: ')
                  if (splitedLine.length > 1) {
                    props.mac_address = splitedLine[1]
                  }
                  else {
                    props.mac_address = 'secured'
                  }
                  return props
                })
            })
            .catch((e) => {
              log.error(e)
              log.info('setting secured mac address because of error')
              props.mac_address = 'secured'
              return props
            })
        })
        .then((props) => {
          return adb.shell(options.serial, 'cat /proc/meminfo | grep MemTotal')
            .timeout(15000)
            .then(function(out) {
              return streamutil.findLine(out, (/^MemTotal:/))
                .timeout(15000)
                .then(function(line) {
                  let total = line.match(/\d+/)
                  if (total) {
                    props.ram = total[0]
                  }
                  else {
                    props.ram = -1
                  }
                  return props
                })
            })
            .catch((e) => {
              log.error(e)
              props.ram = -1
              return props
            })
        })
    }

    return load()
  })
