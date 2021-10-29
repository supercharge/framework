'use strict'

const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { ConsoleLogger } = require('../dist/console-logger')

// let consoleLogMock = Sinon.stub()
// let consoleInfoMock = Sinon.stub()
// let consoleErrorMock = Sinon.stub()

// test.before(() => {
//   consoleLogMock = Sinon.stub(console, 'log').returns(() => {})
//   consoleInfoMock = Sinon.stub(console, 'info').returns(() => {})
//   consoleErrorMock = Sinon.stub(console, 'error').returns(() => {})
// })

// test.after(() => {
//   consoleLogMock.restore()
//   consoleInfoMock.restore()
//   consoleErrorMock.restore()
// })

test('logs debug message to file', () => {
  const consoleLogStub = Sinon.stub(console, 'log').returns(() => {})

  const logger = new ConsoleLogger()
  logger.debug('debug message')

  expect(consoleLogStub.called).toBe(true)
  expect(consoleLogStub.calledWith('debug message')).toBe(true)

  consoleLogStub.restore()

  console.log({ consoleLogStub })
})

test.skip('logs info message to file', () => {
  const logger = new ConsoleLogger()
  logger.info('info message')

  // expect(consoleLogMock.called).toBe(true)
  // expect(consoleLogMock.calledWith('info message')).toBe(true)
})

test.skip('logs notice message to file', async () => {
  const logger = new ConsoleLogger()
  logger.notice('notice message')

  expect(global.console.log.mock.calls[0][0]).toInclude('notice message')
})

test.skip('logs warning message to file', async () => {
  const logger = new ConsoleLogger()
  logger.warning('warning message')

  expect(global.console.log.mock.calls[0][0]).toInclude('warning message')
})

test.skip('logs error message to file', async () => {
  const logger = new ConsoleLogger()
  logger.error('error message')

  expect(global.console.log.mock.calls[0][0]).toInclude('error message')
})

test.skip('logs critical message to file', async () => {
  const logger = new ConsoleLogger()
  logger.critical('critical message')

  expect(global.console.log.mock.calls[0][0]).toInclude('critical message')
})

test.skip('logs alert message to file', async () => {
  const logger = new ConsoleLogger()
  logger.alert('alert message')

  expect(global.console.log.mock.calls[0][0]).toInclude('alert message')
})

test.skip('logs emergency message to file', async () => {
  const logger = new ConsoleLogger()
  logger.emergency('emergency message')

  expect(global.console.log.mock.calls[0][0]).toInclude('emergency message')
})

test.skip('logs message with context data (object)', async () => {
  const logger = new ConsoleLogger()
  logger.info('custom message', { name: 'Marcus', app: 'Supercharge' })

  expect(global.console.log.mock.calls[0][0]).toInclude('"name":"Marcus"')
})

test.skip('handles errors and shows stacktraces', async () => {
  const logger = new ConsoleLogger()
  logger.alert(new Error('Logging failed'))

  expect(global.console.log.mock.calls[0][0]).toInclude('Logging failed')
})

test.skip('honors the log level', async () => {
  const logger = new ConsoleLogger({ level: 'emergency' })
  logger.debug('should not appear')
  logger.emergency('this message should appear')

  expect(global.console.log.mock.calls[0][0]).toInclude('emerg')
  expect(global.console.log.mock.calls[0][0]).toInclude('this message should appear')
  expect(global.console.log.mock.calls[0][0]).not.toInclude('should not appear')
})

test.run()
