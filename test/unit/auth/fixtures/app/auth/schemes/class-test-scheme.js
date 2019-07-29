'use strict'

class TestScheme {
  constructor (server, strategy) {
    this.strategy = strategy
  }

  static get name () {
    return 'class-test-scheme'
  }

  authenticate (request, h) {
    return this.strategy.validate(request, h)
  }
}

module.exports = TestScheme
