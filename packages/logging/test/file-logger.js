'use strict'

const Path = require('path')
const Logger = require('..')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const Fs = require('@supercharge/filesystem')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())

const logFile = Path.resolve(__dirname, 'test.log')

describe('File Logger', () => {
  before(() => {
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
    expect(await Fs.readFile(logFile)).to.include('debug message')
  })

  it('logs info message to file', async () => {
    Logger.info('info message')
    expect(await Fs.readFile(logFile)).to.include('info message')
  })

  it('logs notice message to file', async () => {
    Logger.notice('notice message')
    expect(await Fs.readFile(logFile)).to.include('notice message')
  })

  it('logs warning message to file', async () => {
    Logger.warning('warning message')
    expect(await Fs.readFile(logFile)).to.include('warning message')
  })

  it('logs error message to file', async () => {
    Logger.error('error message')
    expect(await Fs.readFile(logFile)).to.include('error message')
  })

  it('logs critical message to file', async () => {
    Logger.critical('critical message')
    expect(await Fs.readFile(logFile)).to.include('critical message')
  })

  it('logs alert message to file', async () => {
    Logger.alert('alert message')
    expect(await Fs.readFile(logFile)).to.include('alert message')
  })

  it('logs emergency message to file', async () => {
    Logger.emergency('emergency message')
    expect(await Fs.readFile(logFile)).to.include('emergency message')
  })

  it('logs message with context data (object)', async () => {
    Logger.info('custom message', { name: 'Marcus' })
    expect(await Fs.readFile(logFile))
      .to.include('"message":"custom message"')
      .and.to.include('"name":"Marcus"')
  })

  it('honors the log level', async () => {
    Logger.drivers = new Map()
    Logger.setApp(new WarnLevelApp())

    Logger.debug('should not appear')
    expect(await Fs.readFile(logFile)).to.not.include('should not appear')

    Logger.warning('this warning should appear')
    expect(await Fs.readFile(logFile))
      .to.include('"message":"this warning should appear"')
      .and.to.include('"level":"warning"')
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
