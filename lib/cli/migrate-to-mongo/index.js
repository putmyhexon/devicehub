/**
* Copyright © 2023 contains code contributed by V Kontakte LLC, authors: Daniil Smirnov - Licensed under the Apache license 2.0
**/

module.exports.command = 'migrate-to-mongo'

module.exports.describe = 'Migrates the database to mongoDB.'

module.exports.builder = function(yargs) {
  return yargs
}

module.exports.handler = function() {
  const log = require('../../util/logger').createLogger('cli:migrate-to-mongo')
  const rdb = require('./rdb')
  const r = require('rethinkdb')
  const db = require('../../db')
  const tables = ['users', 'groups', 'logs', 'stats', 'accessTokens', 'devices', 'vncauth']
  const Promise = require('bluebird')

  function performMigrate() {
    return db.connect().then(client => {
      Promise.all(tables.map((table) => {
        return rdb.run(r.table(table)).then(cursor => {
          return cursor.toArray()
            .then(tableData => {
              return client.collection(table).insertMany(tableData).then(stats => {
                log.info('Migration result for ' + table + ' inserted ' + stats.insertedCount)
              })
            })
            .catch(e => {
              log.error('Error while migrating ' + table + ' ' + e)
            })
        })
      }))
        .then(() => {
          log.info('Migration ended')
          process.exit(0)
        })
    })
  }

  performMigrate()
}
