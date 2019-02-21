'use strict'

const Listener = require('../../../../../listener')

class TestListener extends Listener {
  on () {
    return 'test.event'
  }

  async handle () { }
}

module.exports = TestListener
