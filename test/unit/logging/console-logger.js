'use strict'

const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const ConsoleLogger = require('../../../logging/transports/console')

class ConsoleLoggerTest extends BaseTest {
  before () {
    Config.set('logging.channels.console', { level: 'debug' })
  }

  async colorForLevel (t) {
    const logger = new ConsoleLogger()
    t.truthy(logger.getColorForLevel('info'))
  }

  async fallbackColorForLevel (t) {
    const logger = new ConsoleLogger()
    t.truthy(logger.getColorForLevel('unavailable-level'))
  }
}

module.exports = new ConsoleLoggerTest()
