'use strict'

const Config = require('../../../config')
const Logger = require('../../../logging')
const BaseTest = require('../../../base-test')
const Application = require('../../../foundation/application')
const LoggingBootstrapper = require('../../../logging/bootstrapper')

class LoggingBootstrapperTest extends BaseTest {
  async before () {
    Config.set('logging.driver', 'console')
  }

  async loadLoggerWithDefaultDriver (t) {
    const app = new Application()
    await app.register(LoggingBootstrapper)
    t.truthy(Logger.driver())
  }
}

module.exports = new LoggingBootstrapperTest()
