'use strict'

const { Logger, LoggingBootstrapper } = require('../dist')

describe('Console Logger', () => {
  beforeAll(() => {
    Logger.setApp(new App())
  })

  beforeEach(() => {
    global.console = {
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
    }
  })

  it('logs debug message to file', () => {
    Logger.debug('debug message')

    expect(global.console.log.mock.calls[0][0]).toInclude('debug message')
  })

  it('logs info message to file', () => {
    Logger.info('info message')

    expect(global.console.log).toHaveBeenCalled()

    // The first argument of the call to the function was the given message
    expect(global.console.log.mock.calls[0][0]).toInclude('info message')
  })

  it('logs notice message to file', async () => {
    Logger.notice('notice message')

    expect(global.console.log.mock.calls[0][0]).toInclude('notice message')
  })

  it('logs warning message to file', async () => {
    Logger.warning('warning message')

    expect(global.console.log.mock.calls[0][0]).toInclude('warning message')
  })

  it('logs error message to file', async () => {
    Logger.error('error message')

    expect(global.console.log.mock.calls[0][0]).toInclude('error message')
  })

  it('logs critical message to file', async () => {
    Logger.critical('critical message')

    expect(global.console.log.mock.calls[0][0]).toInclude('critical message')
  })

  it('logs alert message to file', async () => {
    Logger.alert('alert message')

    expect(global.console.log.mock.calls[0][0]).toInclude('alert message')
  })

  it('logs emergency message to file', async () => {
    Logger.emergency('emergency message')

    expect(global.console.log.mock.calls[0][0]).toInclude('emergency message')
  })

  it('logs message with context data (object)', async () => {
    Logger.info('custom message', { name: 'Marcus', app: 'Supercharge' })

    expect(global.console.log.mock.calls[0][0]).toInclude('"name":"Marcus"')
  })

  it('handles errors and shows stacktraces', async () => {
    Logger.alert(new Error('Logging failed'))

    expect(global.console.log.mock.calls[0][0]).toInclude('Logging failed')
  })

  it('honors the log level', async () => {
    Logger.drivers = new Map()
    Logger.setApp(new EmergencyLevelApp())

    Logger.debug('should not appear')
    Logger.emergency('this message should appear')

    expect(global.console.log.mock.calls[0][0]).toInclude('emerg')
    expect(global.console.log.mock.calls[0][0]).toInclude('this message should appear')
    expect(global.console.log.mock.calls[0][0]).not.toInclude('should not appear')
  })

  it('bootstrapper', async () => {
    const app = new LoggerApp()
    await new LoggingBootstrapper().bootstrap(app)
    expect(Logger.config().get('logging.driver')).toEqual('bootstrapped-logger')
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

class LoggerApp {
  config () {
    return {
      get (configItem) {
        return configItem === 'logging.driver'
          ? 'bootstrapped-logger'
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
