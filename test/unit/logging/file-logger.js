'use strict'

const Path = require('path')
const Winston = require('winston')
const Config = require('../../../config')
const Fs = require('../../../filesystem')
const BaseTest = require('../../../base-test')
const FileLogger = require('../../../logging/transports/file')

class FileLoggerTest extends BaseTest {
  constructor () {
    super()
    this.logfile = Path.resolve(__dirname, 'fixtures/file-logger-testing.log')
  }

  async before () {
    await Fs.ensureFile(this.logfile)

    Config.set('logging.channels.file', { level: 'debug', path: this.logfile })
  }

  async alwaysAfter () {
    await Fs.remove(this.logfile)
  }

  async serialLogToFile (t) {
    const logger = Winston.createLogger().clear().add(new FileLogger().createTransporter())
    logger.info('test log')
    // wait for logger to write the message
    await new Promise(resolve => setTimeout(resolve, 100))

    const content = await Fs.readFile(this.logfile)
    t.true(content.includes('"message":"test log"'))
    t.true(content.includes('"level":"info"'))
    t.true(content.includes('"timestamp":'))
    t.true(content.includes('"time":'))
  }
}

module.exports = new FileLoggerTest()
