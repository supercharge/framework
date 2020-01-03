'use strict'

const Listener = require('../../../../../event/listener')

class TestListener extends Listener {
  on () {
    return 'testing.event'
  }

  async handle () { }
}

module.exports = TestListener
