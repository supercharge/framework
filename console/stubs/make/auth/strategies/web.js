'use strict'

const User = require('../../models/user')

class SessionAuth {
  static get name () {
    return 'web'
  }

  static get scheme () {
    return 'session'
  }

  async validate (request) {
    const { session } = request

    if (!session.userId) {
      return { credentials: null }
    }

    return { credentials: await User.findById(session.userId) }
  }
}

module.exports = SessionAuth
