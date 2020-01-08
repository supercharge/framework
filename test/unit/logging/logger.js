'use strict'

const Config = require('../../../config')
const Logger = require('../../../logging')
const BaseTest = require('../../../base-test')

class LoggerTest extends BaseTest {
  before () {
    Config.set('logging.driver', 'console')
    Config.set('logging.channels.console', { level: 'silly' })
    Config.set('logging.channels.file', { path: './test/temp/testing.log' })

    // TODO
    // Logger.logger.silent = true
  }

  alwaysAfter () {
    // Logger.logger.silent = false
  }

  async loadsDefaultDriver (t) {
    t.truthy(Logger.driver())
  }

  async useConsoleLogger (t) {
    const logger = new Logger.constructor()
    t.truthy(logger.driver('console'))
  }

  async useFileLogger (t) {
    const logger = new Logger.constructor()
    t.truthy(logger.driver('file'))
  }

  async useStackedLogger (t) {
    const logger = new Logger.constructor()
    const driver = logger.driver('stacked')
    t.truthy(driver)
  }

  async throwsForUnavailableLogDriver (t) {
    const logger = new Logger.constructor()
    t.throws(() => logger.driver('unavailable'))
  }

  async serialLogsSillyLevelMessage (t) {
    this.muteConsole()
    Logger.silly('test silly message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test silly message'))
  }

  async serialLogsDebugLevelMessage (t) {
    this.muteConsole()
    Logger.debug('test debug message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test debug message'))
  }

  async serialLogsVerboseLevelMessage (t) {
    this.muteConsole()
    Logger.verbose('test verbose message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test verbose message'))
  }

  async serialLogsInfoLevelMessage (t) {
    this.muteConsole()
    Logger.info('test info message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test info message'))
  }

  async serialLogsWarnLevelMessage (t) {
    this.muteConsole()
    Logger.warn('test warn message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test warn message'))
  }

  async serialLogsErrorLevelMessage (t) {
    this.muteConsole()
    Logger.error('test error message')
    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('test error message'))
  }

  async serialLogsErrorMessageFromError (t) {
    const message = 'error test message'

    this.muteConsole()
    Logger.error(new Error(message))
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes(message))
  }

  async serialConsoleLoggerFallback (t) {
    Config.set('logging.driver', null)

    this.muteConsole()
    Logger.info('console fallback message')

    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('console fallback message'))
  }
}

module.exports = new LoggerTest()
