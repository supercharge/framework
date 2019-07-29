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

    return this.credentialsFor(session.get('userId'))
  }

  async credentialsFor (userId) {
    return {
      credentials: await User.findById(userId)
    }
  }
}

module.exports = SessionAuth
