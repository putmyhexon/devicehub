/**
 * Copyright © 2023 code initially contributed by VKontakte LLC, authors: Daniil Smirnov - Licensed under the Apache license 2.0
 **/

module.exports.command = 'generate-service-user'

module.exports.builder = function(yargs) {
  return yargs
    .strict()
    .option('admin', {
      alias: 'admin'
      , describe: 'user need to be admin'
      , type: 'boolean'
      , default: false
    })
    .option('name', {
      alias: 'name'
      , describe: 'display name for user'
      , type: 'string'
    })
    .option('email', {
      alias: 'email'
      , describe: 'email address'
      , type: 'string'
    })
    .option('secret', {
    alias: 'secret'
    , describe: 'secret used in tokens'
    , type: 'string'
    , default: 'kute kittykat' // this secret used in stf local run only lib/cli/local/index.js:58
  })
}

module.exports.handler = function(argv) {
  const log = require('../../util/logger').createLogger('cli:generate-service-user')
  const service = require('../../util/serviceuser')

  const admin = argv.admin
  const name = argv.name
  const email = argv.email
  const secret = argv.secret

  function next() {
    return service.generate(email, name, admin, secret).then(function(info) {
      log.info('Created service user ' + info.email + ' with token ' + info.token)
    })
  }

  return next()
    .then(function() {
      process.exit(0)
    })
    .catch(function(err) {
      log.fatal('Service user creation had an error:', err.stack)
      process.exit(1)
    })
}
