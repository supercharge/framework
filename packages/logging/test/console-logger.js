'use strict'

const { ConsoleLogger } = require('../dist/src/console-logger')

describe('Console Logger', () => {
  beforeEach(() => {
    global.console = {
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
    }
  })

  it('logs debug message to file', () => {
    const logger = new ConsoleLogger()
    logger.debug('debug message')

    expect(global.console.log.mock.calls[0][0]).toInclude('debug message')
  })

  it('logs info message to file', () => {
    const logger = new ConsoleLogger()
    logger.info('info message')

    expect(global.console.log).toHaveBeenCalled()

    // The first argument of the call to the function was the given message
    expect(global.console.log.mock.calls[0][0]).toInclude('info message')
  })

  it('logs notice message to file', async () => {
    const logger = new ConsoleLogger()
    logger.notice('notice message')

    expect(global.console.log.mock.calls[0][0]).toInclude('notice message')
  })

  it('logs warning message to file', async () => {
    const logger = new ConsoleLogger()
    logger.warning('warning message')

    expect(global.console.log.mock.calls[0][0]).toInclude('warning message')
  })

  it('logs error message to file', async () => {
    const logger = new ConsoleLogger()
    logger.error('error message')

    expect(global.console.log.mock.calls[0][0]).toInclude('error message')
  })

  it('logs critical message to file', async () => {
    const logger = new ConsoleLogger()
    logger.critical('critical message')

    expect(global.console.log.mock.calls[0][0]).toInclude('critical message')
  })

  it('logs alert message to file', async () => {
    const logger = new ConsoleLogger()
    logger.alert('alert message')

    expect(global.console.log.mock.calls[0][0]).toInclude('alert message')
  })

  it('logs emergency message to file', async () => {
    const logger = new ConsoleLogger()
    logger.emergency('emergency message')

    expect(global.console.log.mock.calls[0][0]).toInclude('emergency message')
  })

  it('logs message with context data (object)', async () => {
    const logger = new ConsoleLogger()
    logger.info('custom message', { name: 'Marcus', app: 'Supercharge' })

    expect(global.console.log.mock.calls[0][0]).toInclude('"name":"Marcus"')
  })

  it('handles errors and shows stacktraces', async () => {
    const logger = new ConsoleLogger()
    logger.alert(new Error('Logging failed'))

    expect(global.console.log.mock.calls[0][0]).toInclude('Logging failed')
  })

  it('honors the log level', async () => {
    const logger = new ConsoleLogger({ level: 'emergency' })
    logger.debug('should not appear')
    logger.emergency('this message should appear')

    expect(global.console.log.mock.calls[0][0]).toInclude('emerg')
    expect(global.console.log.mock.calls[0][0]).toInclude('this message should appear')
    expect(global.console.log.mock.calls[0][0]).not.toInclude('should not appear')
  })
})
