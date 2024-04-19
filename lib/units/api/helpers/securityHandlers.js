/**
* Copyright © 2023 contains code contributed by V Kontakte LLC, authors: Daniil Smirnov - Licensed under the Apache license 2.0
**/

const dbapi = require('../../../db/api')
const jwtutil = require('../../../util/jwtutil')
const logger = require('../../../util/logger')
const apiutil = require('../../../util/apiutil')
const log = logger.createLogger('api:helpers:securityHandlers')

module.exports = {
  accessTokenAuth: accessTokenAuth
}

// Specifications: https://tools.ietf.org/html/rfc6750#section-2.1

function accessTokenAuth(req, res, next) {
  if (process.env.MAINTENANCE_MODE === '1') {
    return res.status(500).json({
      success: false
      , description: 'Maintenance Mode. Please wait'
    })
  }

  let operationTag
  if (req.swagger) {
    operationTag = req.swagger.operation.definition.tags
  }
  else {
    operationTag = 'not-swagger'
  }


  if (req.headers.authorization) {
    let authHeader = req.headers.authorization.split(' ')
    let format = authHeader[0]
    let tokenId = authHeader[1]

    if (format !== 'Bearer') {
      return res.status(401).json({
        success: false
      , description: 'Authorization header should be in "Bearer $AUTH_TOKEN" format'
      })
    }

    if (!tokenId) {
      log.error('Bad Access Token Header')
      return res.status(401).json({
        success: false
      , description: 'Bad Credentials'
      })
    }

    return dbapi.loadAccessToken(tokenId)
      .then(function(token) {
        if (!token) {
          return res.status(401).json({
            success: false
          , description: 'Bad Credentials'
          })
        }

        let jwt = token.jwt
        let data = jwtutil.decode(jwt, req.options.secret)
        if (!data) {
          return res.status(401).json({
            success: false
          , description: 'Cant decode JWT'
          })
        }

        return dbapi.loadUser(data.email)
          .then(function(user) {
            if (user) {
              if (user.privilege === apiutil.USER && operationTag.indexOf('admin') > -1) {
                return res.status(403).json({
                  success: false
                , description: 'Forbidden: privileged operation (admin)'
                })
              }
              req.user = user
              req.internalJwt = jwt
              next()
            }
            else {
              return res.status(404).json({
                success: false
              , description: 'User is not exist'
              })
            }
          })
          .catch(function(err) {
            log.error('Failed to load user: ', err.stack)
          })
      })
      .catch(function(err) {
        log.error('Failed to load token: ', err.stack)
        return res.status(401).json({
          success: false
        , description: 'Bad Credentials'
        })
      })
  }
  // Request is coming from browser app
  // TODO: Remove this once frontend become stateless
  //       and start sending request without session
  else if (req.session && req.session.jwt) {
    return dbapi.loadUser(req.session.jwt.email)
      .then((user) => {
        if (user) {
          req.user = user
          const internalJwt = jwtutil.encode({
            payload: {
              email: req.session.jwt.email
              , name: req.session.jwt.name
            }
            , secret: req.options.secret
          })
          req.internalJwt = internalJwt
          next()
        }
        else {
          return res.status(500).json({
            success: false
          , description: 'Internal Server Error'
          })
        }
      })
      .catch(next)
  }
  else if (req.headers.internal) {
    let authHeader = req.headers.internal.split(' ')
    let format = authHeader[0]
    let tokenId = authHeader[1]

    if (format !== 'Internal') {
      return res.status(401).json({
        success: false
        , description: 'Authorization header should be in "Internal $AUTH_TOKEN" format'
      })
    }

    if (!tokenId) {
      log.error('Bad Access Token Header')
      return res.status(401).json({
        success: false
        , description: 'Bad Credentials'
      })
    }

    let data = jwtutil.decode(tokenId, req.options.secret)
    if (!data) {
      return res.status(401).json({
        success: false
        , description: 'Cant decode JWT'
      })
    }

    return dbapi.loadUser(data.email)
      .then(function(user) {
        if (user) {
          if (user.privilege === apiutil.USER && operationTag.indexOf('admin') > -1) {
            return res.status(403).json({
              success: false
              , description: 'Forbidden: privileged operation (admin)'
            })
          }
          req.user = user
          next()
        }
        else {
          return res.status(404).json({
            success: false
            , description: 'User is not exist'
          })
        }
      })
      .catch(function(err) {
        log.error('Failed to load user: ', err.stack)
      })
  }
  else if (req.headers.channel && req.headers.device) {
    let serial = req.headers.device
    return dbapi.loadDeviceBySerial(serial).then(device => {
      // Нужна проверка что канал именно от этого девайса или проверочки на эндпоинт
      const internalJwt = jwtutil.encode({
        payload: {
          email: device.owner.email
          , name: device.owner.name
        }
        , secret: req.options.secret
      })
      req.internalJwt = internalJwt
      next()
    })
  }
  else {
    return res.status(401).json({
      success: false
    , description: 'Requires Authentication'
    })
  }
}
