'use strict'

module.exports = {
  name: 'test-scheme',
  scheme: () => {
    return {
      authenticate: (_, h) => {
        return h.authenticated({ credentials: { user: 'marcus' } })
      }
    }
  }
}
