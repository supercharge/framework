'use strict'

const Event = require('../../../../../event')

class TestEvent extends Event {
  emit () {
    return 'test.event'
  }
}

module.exports = TestEvent
