const apiutil = require('../../../util/apiutil')
const dbapi = require('../../../db/api')

function writeStats(req, res) {
  const user = req.user.name
  const serial = req.query.serial
  const action = req.query.action
  dbapi.writeStats(user, serial, action)
    .then((r) => {
      apiutil.respond(res, 200, r)
    })
    .catch(() => {
      apiutil.internalError(res, 'Failed')
    })
}


module.exports = {
  writeStats: writeStats
}
