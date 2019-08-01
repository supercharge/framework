'use strict'

const Winston = require('winston')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const ConsoleLogger = require('../../../logging/driver/console-logger')

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

  async customFormat (t) {
    const logger = new ConsoleLogger()
    t.true(logger.format({ level: 'debug', message: 'testing' }).includes('debug'))
    t.true(logger.format({ level: 'debug', message: 'testing' }).includes('testing'))
  }

  async serialCustomFormatFromLogger (t) {
    const consoleLogger = new ConsoleLogger()
    const stub = this.stub(consoleLogger, 'format').throws(new Error('logger format error'))

    const logger = Winston.createLogger()
    logger.add(consoleLogger.logger())
    t.throws(() => logger.info(''))

    this.sinon().assert.called(stub)
    stub.restore()
  }
}

module.exports = new ConsoleLoggerTest()
