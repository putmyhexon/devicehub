var http = require('http')
var url = require('url')
var fs = require('fs')

var express = require('express')
var validator = require('express-validator')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
var serveFavicon = require('serve-favicon')
var serveStatic = require('serve-static')
var csrf = require('csurf')
var compression = require('compression')

var logger = require('../../util/logger')
var pathutil = require('../../util/pathutil')

var auth = require('./middleware/auth')
var deviceIconMiddleware = require('./middleware/device-icons')
var browserIconMiddleware = require('./middleware/browser-icons')
var appstoreIconMiddleware = require('./middleware/appstore-icons')
let rateLimitConfig = require('../ratelimit')

var markdownServe = require('markdown-serve')
const dbapi = require('../../db/api')

module.exports = function(options) {
  var log = logger.createLogger('app')
  var app = express()
  var server = http.createServer(app)

  app.use('/static/wiki', markdownServe.middleware({
    rootDirectory: pathutil.root('node_modules/@devicefarmer/stf-wiki')
  , view: 'docs'
  }))

  app.set('view engine', 'pug')
  app.set('views', pathutil.resource('app/views'))
  app.set('strict routing', true)
  app.set('case sensitive routing', true)
  app.set('trust proxy', true)
  app.use(rateLimitConfig)

  if (fs.existsSync(pathutil.resource('build'))) {
    log.info('Using pre-built resources')
    app.use(compression())
    app.use('/static/app/build/entry',
      serveStatic(pathutil.resource('build/entry')))
    app.use('/static/app/build', serveStatic(pathutil.resource('build'), {
      maxAge: '86400',
    }))
  }
  else {
    log.info('Using webpack')
    // Keep webpack-related requires here, as our prebuilt package won't
    // have them at all.
    let webpackServerConfig = require('./../../../webpack.config').webpackServer
    app.use('/static/app/build',
      require('./middleware/webpack')(webpackServerConfig))
  }

  app.use('/static/app/data', serveStatic(pathutil.resource('data')))
  app.use('/static/app/status', serveStatic(pathutil.resource('common/status')))
  app.use('/static/app/browsers', browserIconMiddleware())
  app.use('/static/app/appstores', appstoreIconMiddleware())
  app.use('/static/app/devices', deviceIconMiddleware())
  app.use('/static/app', serveStatic(pathutil.resource('app')))

  app.use('/static/logo',
    serveStatic(pathutil.resource('common/logo')))
  app.use(serveFavicon(pathutil.resource(
    'common/logo/exports/hub_favicon.png')))

  app.use(cookieSession({
    name: options.ssid
  , keys: [options.secret]
  }))

  app.use(auth({
    secret: options.secret
  , authUrl: options.authUrl
  }))

  // This needs to be before the csrf() middleware or we'll get nasty
  // errors in the logs. The dummy endpoint is a hack used to enable
  // autocomplete on some text fields.
  app.all('/app/api/v1/dummy', function(req, res) {
    res.send('OK')
  })

  app.use(bodyParser.json())
  app.use(csrf())
  app.use(validator())

  app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken())
    res.set('Cache-Control', 'private, max-age=86400')
    next()
  })

  app.get('/', function(req, res) {
    res.render('index')
  })

  app.get('/app/api/v1/auth_url', function(req, res) {
    res.send({
      authUrl: options.authUrl
    })
  })

  app.get('/app/api/v1/state.js', function(req, res) {
    let state = {
      config: {
        websocketUrl: (function() {
          let wsUrl = url.parse(options.websocketUrl, true)
          wsUrl.query.uip = req.ip
          return url.format(wsUrl)
        })()
      }
    , user: req.user
    }

    if (options.userProfileUrl) {
      state.config.userProfileUrl = (function() {
        return options.userProfileUrl
      })()
    }

    res.type('application/javascript')
    res.send('var GLOBAL_APPSTATE = ' + JSON.stringify(state))
  })

  app.get('/app/api/v1/healthcheck', function(req, res) {
    let state = {
    }
    dbapi.getReadyDevicesCount().then(readyAmount => {
      state.readyDevicesCount = readyAmount
      state.usableForAutotests = readyAmount >= 5
      dbapi.getOfflineDevicesCount().then((offlineAmount) => {
        state.offlineDevicesCount = offlineAmount
        state.healthy = offlineAmount >= 5
        dbapi.getOfflineDevices().then(devices => {
          state.offlineDevicesExtendedInfo = devices
          res.send(state)
        })
      })
    })
  })

  server.listen(options.port)
  log.info('Listening on port %d', options.port)
}
