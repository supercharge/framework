'use strict'

const Event = require('../../../../../event')

class TestEvent extends Event {
  emit () {
    return 'testing.event'
  }
}

module.exports = TestEvent
