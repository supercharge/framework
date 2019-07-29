'use strict'

class TestAuthStrategy {
  static get name () {
    return 'class-test-auth'
  }

  static get scheme () {
    return 'class-test-scheme' // defined in the related test
  }

  validate (request, h) {
    return h.authenticated({ credentials: { name: 'Marcus' } })
  }
}

module.exports = TestAuthStrategy
