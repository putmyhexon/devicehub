/**
* Copyright © 2019 contains code contributed by Orange SA, authors: Denis Barbaron - Licensed under the Apache license 2.0
**/

const jwtutil = require('../../../util/jwtutil')
const urlutil = require('../../../util/urlutil')

const dbapi = require('../../../db/api')
const {accessTokenAuth} = require('../../api/helpers/securityHandlers')

module.exports = function(options) {
  return function(req, res, next) {
    if (process.env.MAINTENANCE_MODE === '1') {
      return res.status(500).json({
        success: false
        , description: 'Maintenance Mode. Please wait'
      })
    }

    if (req.query.jwt) {
      // Coming from auth client
      let data = jwtutil.decode(req.query.jwt, options.secret)
      let redir = urlutil.removeParam(req.url, 'jwt')
      if (data) {
        // Redirect once to get rid of the token
        dbapi.saveUserAfterLogin({
            name: data.name
          , email: data.email
          , ip: req.ip
          })
          .then(function() {
            req.session.jwt = data
            req.sessionOptions.httpOnly = false

            dbapi.loadUser(data.email).then(user => {
              if(user.acceptedPolicy) {
                res.redirect(redir)
              }
              else {
                res.redirect(redir + '?need_accept=1')
              }
            })
          })
          .catch(next)
      }
      else {
        // Invalid token, forward to auth client
        const response = {
          success: false
          , description: 'Invalid Token'
        }
        res.setHeader('Cache-Control', 'no-store')
        res.status(403).json(response)
      }
    }
    else if (req.session && req.session.jwt) {
      dbapi.loadUser(req.session.jwt.email)
        .then(function(user) {
          if (user) {
            // Continue existing session
            req.user = user
            next()
          }
          else {
            // We no longer have the user in the database
            res.redirect(options.authUrl)
          }
        })
        .catch(next)
    }
    else if (req.headers.authorization) { // needed for /app/api/v1/ requests
      req.options = {
        secret: options.secret
      }
      accessTokenAuth(req, res, next)
    }
    else {
      // No session, forward to auth client
      res.redirect(options.authUrl)
    }
  }
}
