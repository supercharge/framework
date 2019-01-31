'use strict'

const Event = require('@root/event')

class TestEvent extends Event {
  emit () {
    return 'test.event'
  }
}

module.exports = TestEvent
