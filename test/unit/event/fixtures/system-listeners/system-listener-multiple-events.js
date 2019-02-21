'use strict'

const Listener = require('../../../../../listener')

class TestListener extends Listener {
  on () {
    return ['system.test.event', 'system.another.test.event']
  }

  type () {
    return 'system'
  }

  async handle () {
    console.log('this is a system event')
  }
}

module.exports = TestListener
