import * as dbapi from '../../../db/api.js'
import * as jwtutil from '../../../util/jwtutil.js'
import * as cookie from 'cookie'
import logger from '../../../util/logger.js'


export default (function(options) {
    const log = logger.createLogger('websocket')
    return function(socket, next) {
        let req = socket.request
        let token, cookies
        try {
            cookies = cookie.parse(req.headers.cookie)
        }
        catch (e) {
            return next(new Error('Missing authorization token'))
        }
        if (cookies.token) {
            token = jwtutil.decode(cookies.token, options.secret)
            req.internalJwt = cookies.token
        }
        else {
            return next(new Error('Missing authorization token'))
        }
        if (token) {
            return dbapi.loadUser(token.email)
                .then(function(user) {
                    if (user) {
                        req.user = user
                        return next()
                    }
                    else {
                        return next(new Error('Invalid user'))
                    }
                })
                .catch((e) => {
                    log.error(e)
                    return next(new Error('Unknown error'))
                })
        }
        else {
            return next(new Error('Missing authorization token'))
        }
    }
})
