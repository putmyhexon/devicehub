const util = require('util')

const syrup = require('@devicefarmer/stf-syrup')
const ProtoBuf = require('protobufjs')
const semver = require('semver')

const pathutil = require('../../../util/pathutil')
const streamutil = require('../../../util/streamutil')
const logger = require('../../../util/logger')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .define(function(options, adb) {
    let log = logger.createLogger('device:resources:service')
    let builder = ProtoBuf.loadProtoFile(
      pathutil.vendor('STFService/wire.proto'))

    let STFServiceResource = {
      requiredVersion: '2.5.3'
    , pkg: 'jp.co.cyberagent.stf'
    , main: 'jp.co.cyberagent.stf.Agent'
    , apk: pathutil.vendor('STFService/STFService.apk')
    , wire: builder.build().jp.co.cyberagent.stf.proto
    , builder: builder
    , startIntent: {
        action: 'jp.co.cyberagent.stf.ACTION_START'
      , component: 'jp.co.cyberagent.stf/.Service'
      }
    }
// am startservice -a jp.co.cyberagent.stf.ACTION_START jp.co.cyberagent.stf/.Service
    function getPath() {
      return adb.shell(options.serial, ['pm', 'path', STFServiceResource.pkg])
        .timeout(10000)
        .then(function(out) {
          return streamutil.findLine(out, (/^package:/))
            .timeout(15000)
            .then(function(line) {
              return line.substr(8)
            })
        })
    }

    function install() {
      log.info('Checking whether we need to install STFService')
      return getPath()
        .then(function(installedPath) {
          log.info('Running version check')
          return adb.shell(options.serial, util.format(
            "export CLASSPATH='%s';" +
            " exec app_process /system/bin '%s' --version 2>/dev/null"
          , installedPath
          , STFServiceResource.main
          ))
          .timeout(10000)
          .then(function(out) {
            return streamutil.readAll(out)
              .timeout(10000)
              .then(function(buffer) {
                let version = buffer.toString()
                if (semver.satisfies(version, STFServiceResource.requiredVersion)) {
                  return installedPath
                }
                else {
                  throw new Error(util.format(
                    'Incompatible version %s'
                  , version
                  ))
                }
              })
          })
        })
        .catch(function() {
          log.info('Installing STFService')
          try {
            adb.install(options.serial, STFServiceResource.apk)
              .then(function() {
                return getPath()
              })
          }
          catch (e) {
            log.error('INSTALLING ERROR' + e)
          }
        })
    }

    return install()
      .then(function(path) {
        adb.shell(options.serial, 'ime enable jp.co.cyberagent.stf/.ADBKeyBoardService')
        adb.shell(options.serial, 'ime set jp.co.cyberagent.stf/.ADBKeyBoardService')
        log.info('STFService up to date')
        STFServiceResource.path = path
        return STFServiceResource
      })
  })
