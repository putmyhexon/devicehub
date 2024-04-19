const {rateLimit} = require('express-rate-limit')


let rateLimitConfig = rateLimit({
  windowMs: 60 * 1000 // 1 minute
  , limit: 2000 // Limit each IP to 2000 requests per `window`
  , standardHeaders: 'draft-7' // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  , legacyHeaders: false // Disable the `X-RateLimit-*` headers
  , keyGenerator: (req, res) => {
    return req.headers['X-Real-IP'] ? req.headers['X-Real-IP'] : 'localhost' // IP address from requestIp.mw(), as opposed to req.ip
  }
})

module.exports = rateLimitConfig
