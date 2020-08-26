'use strict'

const Logger = require('..')
const MockStd = require('mock-stdio')

describe('Console Logger', () => {
  beforeAll(() => {
    Logger.setApp(new App())
  })

  it('logs debug message to file', () => {
    MockStd.start()
    Logger.debug('debug message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('debug message')
  })

  it('logs info message to file', async () => {
    MockStd.start()
    Logger.info('info message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('info message')
  })

  it('logs notice message to file', async () => {
    MockStd.start()
    Logger.notice('notice message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('notice message')
  })

  it('logs warning message to file', async () => {
    MockStd.start()
    Logger.warning('warning message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('warning message')
  })

  it('logs error message to file', async () => {
    MockStd.start()
    Logger.error('error message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('error message')
  })

  it('logs critical message to file', async () => {
    MockStd.start()
    Logger.critical('critical message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('critical message')
  })

  it('logs alert message to file', async () => {
    MockStd.start()
    Logger.alert('alert message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('alert message')
  })

  it('logs emergency message to file', async () => {
    MockStd.start()
    Logger.emergency('emergency message')

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('emergency message')
  })

  it('logs message with context data (object)', async () => {
    MockStd.start()
    Logger.info('custom message', { name: 'Marcus', app: 'Supercharge' })

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('"name":"Marcus"')
  })

  it('handles errors and shows stacktraces', async () => {
    MockStd.start()
    Logger.alert(new Error('Logging failed'))

    const { stdout } = MockStd.end()
    expect(stdout).toInclude('Logging failed')
  })

  it('honors the log level', async () => {
    Logger.drivers = new Map()
    Logger.setApp(new EmergencyLevelApp())

    MockStd.start()
    Logger.debug('should not appear')
    Logger.emergency('this message should appear')
    const { stdout } = MockStd.end()

    expect(stdout).toInclude('emerg')
    expect(stdout).toInclude('this message should appear')
    expect(stdout).not.toInclude('should not appear')
  })
})

class App {
  config () {
    return {
      get (configItem) {
        return configItem === 'logging.driver'
          ? 'console'
          : { }
      }
    }
  }
}

class EmergencyLevelApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'logging.driver'
          ? 'console'
          : { level: 'emergency' }
      }
    }
  }
}
