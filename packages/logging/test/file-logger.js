'use strict'

const Path = require('path')
const Logger = require('..')
const Fs = require('@supercharge/filesystem')

const logFile = Path.resolve(__dirname, 'test.log')

describe('File Logger', () => {
  beforeAll(() => {
    Logger.setApp(new App())
    Logger.info('starting tests')
  })

  beforeEach(async () => {
    await Fs.ensureFile(logFile)
  })

  afterEach(async () => {
    await Fs.removeFile(logFile)
  })

  it('logs debug message to file', async () => {
    Logger.debug('debug message')
    expect(await Fs.readFile(logFile)).toInclude('debug message')
  })

  it('logs info message to file', async () => {
    Logger.info('info message')
    expect(await Fs.readFile(logFile)).toInclude('info message')
  })

  it('logs notice message to file', async () => {
    Logger.notice('notice message')
    expect(await Fs.readFile(logFile)).toInclude('notice message')
  })

  it('logs warning message to file', async () => {
    Logger.warning('warning message')
    expect(await Fs.readFile(logFile)).toInclude('warning message')
  })

  it('logs error message to file', async () => {
    Logger.error('error message')
    expect(await Fs.readFile(logFile)).toInclude('error message')
  })

  it('logs critical message to file', async () => {
    Logger.critical('critical message')
    expect(await Fs.readFile(logFile)).toInclude('critical message')
  })

  it('logs alert message to file', async () => {
    Logger.alert('alert message')
    expect(await Fs.readFile(logFile)).toInclude('alert message')
  })

  it('logs emergency message to file', async () => {
    Logger.emergency('emergency message')
    expect(await Fs.readFile(logFile)).toInclude('emergency message')
  })

  it('logs message with context data (object)', async () => {
    Logger.info('custom message', { name: 'Marcus' })

    const content = await Fs.readFile(logFile)
    expect(content).toInclude('"message":"custom message"')
    expect(content).toInclude('"name":"Marcus"')
  })

  it('honors the log level', async () => {
    Logger.drivers = new Map()
    Logger.setApp(new WarnLevelApp())

    Logger.debug('should not appear')
    expect(await Fs.readFile(logFile)).not.toInclude('should not appear')

    Logger.warning('this warning should appear')

    const content = await Fs.readFile(logFile)
    expect(content).toInclude('"message":"this warning should appear"')
    expect(content).toInclude('"level":"warning"')
  })
})

class App {
  config () {
    return {
      get (configItem) {
        return configItem === 'logging.driver'
          ? 'file'
          : { path: logFile }
      }
    }
  }
}

class WarnLevelApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'logging.driver'
          ? 'file'
          : { level: 'warning', path: logFile }
      }
    }
  }
}
