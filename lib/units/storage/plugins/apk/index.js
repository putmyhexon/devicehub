var http = require('http')
var url = require('url')
var util = require('util')
var express = require('express')
var request = require('postman-request')

var logger = require('../../../../util/logger')
var download = require('../../../../util/download')
var manifest = require('./task/manifest')
let rateLimitConfig = require('../../../ratelimit')
const {accessTokenAuth} = require('../../../api/helpers/securityHandlers')
const cookieSession = require('cookie-session')
const csrf = require('csurf')
const apiutil = require('../../../../util/apiutil')

module.exports = function(options) {
  var log = logger.createLogger('storage:plugins:apk')
  var app = express()
  var server = http.createServer(app)
  // eslint-disable-next-line new-cap
  const route = express.Router()
  log.info('cacheDir located at ' + options.cacheDir)


  app.use(rateLimitConfig)
  app.use(cookieSession({
    name: options.ssid
    , keys: [options.secret]
  }))
  app.use(function(req, res, next) {
    req.options = {
      secret: options.secret
    }
    accessTokenAuth(req, res, next)
  })
  app.use(csrf())
  app.use(route)

  app.set('strict routing', true)
  app.set('case sensitive routing', true)
  app.set('trust proxy', true)

  route.get('/s/apk/:id/:name/manifest', function(req, res) {
    var orig = util.format(
      '/s/blob/%s/%s'
      , req.params.id
      , req.params.name
    )

    let downloadUrl = url.resolve(options.storageUrl, orig)
    download(downloadUrl, {
      dir: options.cacheDir
      , jwt: req.internalJwt
    })
      .then((file) => {
        log.info('Got apk from ' + downloadUrl + ' in ' + file.path)
        manifest(file).then(data => {
          res.status(200)
            .json({
              success: true
              , manifest: data
            })
        })
      })
      .catch(function(err) {
        log.error('Unable to read manifest of "%s"', req.params.id, err.stack)
        res.status(400)
          .json({
            success: false
          })
      })
  })

  route.get('/s/apk/:id/:name', function(req, res) {
    request(url.resolve(options.storageUrl, util.format(
        '/s/blob/%s/%s'
        , req.params.id
        , req.params.name
      )), {
        headers: {
          internal: 'Internal ' + req.internalJwt
        }
        , timeout: apiutil.INSTALL_APK_WAIT
        , pool: {maxSockets: Infinity}
      }
    )
      .pipe(res)
  })

  server.listen(options.port)
  log.info('Listening on port %d', options.port)
}
