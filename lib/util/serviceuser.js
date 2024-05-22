/**
 * Copyright © 2023 code initially contributed by VKontakte LLC, authors: Daniil Smirnov - Licensed under the Apache license 2.0
 **/

const dbapi = require('../db/api')
const jwtutil = require('./jwtutil')
const util = require('util')
const uuid = require('uuid')

module.exports.generate = function(email, name, admin, secret) {
  const tokenTitle = 'serviceToken'

  let jwt = jwtutil.encode({
    payload: {
      email: email
      , name: name
    }
    , secret: secret
  })

  let tokenId = util.format('%s-%s', uuid.v4(), uuid.v4()).replace(/-/g, '')


  return dbapi.createUser(email, name, '127.0.0.1').then(stats => {
    if (!stats.insertedId) {
      throw Error('User is not created in database. Check MongoDB logs')
    }
    let userInfo = {
      email: email
    }
    return dbapi.saveUserAccessToken(
      email,
      {
        title: tokenTitle
        , id: tokenId
        , jwt: jwt
      }
    ).then(() => {
      userInfo.token = tokenId
      if (admin) {
        return dbapi.grantAdmin(email).then(() => {
          return userInfo
        })
      }
      return userInfo
    })
  })
}
