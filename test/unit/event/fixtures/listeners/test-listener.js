'use strict'

const Listener = require('@root/Listener')

class TestListener extends Listener {
  on () {
    return 'test.event'
  }

  async handle () { }
}

module.exports = TestListener
