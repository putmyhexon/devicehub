var http = require('http')

var openid = require('openid-client')
var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var logger = require('../../util/logger')
var jwtutil = require('../../util/jwtutil')
var urlutil = require('../../util/urlutil')
let rateLimitConfig = require('../ratelimit')

module.exports = function(options) {
  var log = logger.createLogger('auth-openid')

  var app = express()
  var client
  const redirectUri = options.appUrl + '/auth/openid/callback'

  openid.Issuer.discover(options.openid.identifierUrl).then((keycloakIssuer) => {
    client = new keycloakIssuer.Client({
      client_id: options.openid.clientId
      , client_secret: options.openid.clientSecret
      , redirect_uris: [redirectUri]
      , response_types: ['id_token'],
    })
  }).catch((err) => {
    log.error('Couldn\'t discover.')
    log.error(err)
    process.exit(1)
  })

  app.use(rateLimitConfig)
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({extended: false}))
  app.set('strict routing', true)
  app.set('case sensitive routing', true)

  app.get('/', function(req, res) {
    res.redirect('/auth/openid/')
  })

  app.get('/auth/openid/', function(req, res) {
    const nonce = openid.generators.nonce()
    // store the nonce in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.
    if (client) {
      const url = client.authorizationUrl({
        scope: 'openid email profile'
        , response_mode: 'form_post'
        , nonce,
      })
      res.cookie('openid-nonce', nonce, {
        httpOnly: true
      })
      res.redirect(url)
    }
    else {
      res.redirect('/auth/openid/')
    }
  })

  app.post('/auth/openid/callback', function(req, res) {
    log.setLocalIdentifier(req.ip)
    var nonce = req.cookies['openid-nonce']
    if(!nonce) {
      res.send('Missed openid-nonce')
      return
    }

    const params = client.callbackParams(req)
    client.callback(redirectUri, params, {nonce}).then((tokenSet) => {
      let claims = tokenSet.claims()
      let token = jwtutil.encode({
        payload: {
            email: claims.email
          , name: claims.name
        }
        , secret: options.secret
      })
      log.info('Authenticated "%s"', claims.email)
      res.redirect(urlutil.addParams(options.appUrl, {jwt: token}))
    })
})
  app.get('/auth/contact', function(req, res) {
    res.status(200)
      .json({
        success: true
        , contactUrl: options.supportUrl
      })
  })

  app.get('/auth/docs', function(req, res) {
    res.status(200)
      .json({
        success: true
        , docsUrl: options.docsUrl
      })
  })

http.createServer(app).listen(options.port)
log.info('Listening on port %d', options.port)
}
