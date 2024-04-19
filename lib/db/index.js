const mongo = require('mongodb')

const setup = require('./setup')
const logger = require('../util/logger')
const lifecycle = require('../util/lifecycle')
const srv = require('../util/srv')
const log = logger.createLogger('db')

const db = module.exports = Object.create(null)

let mongoClient
let options = {
  // These environment variables are exposed when we --link to a
  // MongoDB container.
  url: process.env.MONGODB_PORT_27017_TCP || 'mongodb://127.0.0.1:27017'
  , db: process.env.MONGODB_DB_NAME || 'stf'
  , authKey: process.env.MONGODB_ENV_AUTHKEY
  , adbPortsRange: process.env.adbPortsRange || '29000-29999'
}

function connect() {
  return srv.resolve(options.url)
    .then(records => {
      let record = records.shift()

      if (!record) {
        throw new Error('No hosts left to try')
      }
      const client = new mongo.MongoClient(options.url, {monitorCommands: true})
      client.on('commandFailed', (event) => log.info(JSON.stringify(event)))
      if (mongoClient) {
        return mongoClient
      }
      else {
        mongoClient = client.connect()
        return mongoClient
      }
    })
}

db.connect = function() {
  return connect()
    .then(function(client) {
      return client.db(options.db)
    })
    .catch(function(err) {
      log.fatal(err.message)
      lifecycle.fatal()
    })
}

// Verifies that we can form a connection. Useful if it's necessary to make
// sure that a handler doesn't run at all if the database is on a break. In
// normal operation connections are formed lazily. In particular, this was
// an issue with the processor unit, as it started processing messages before
// it was actually truly able to save anything to the database. This lead to
// lost messages in certain situations.
db.ensureConnectivity = function(fn) {
  return function() {
    let args = [].slice.call(arguments)
    return db.connect().then(function() {
      return fn.apply(null, args)
    })
  }
}


// Sets up the database
db.setup = function() {
  return db.connect().then(function(conn) {
    return setup(conn)
  })
}

db.getRange = function() {
  return '20000-29999'
}
