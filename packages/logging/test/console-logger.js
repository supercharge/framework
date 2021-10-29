'use strict'

const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { ConsoleLogger } = require('../dist/console-logger')

test('logs debug message to console', () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.debug('debug message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('debug message'))
  ).toBe(true)
})

test('logs info message to console', () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.info('info message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('info message'))
  ).toBe(true)
})

test('logs notice message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.notice('notice message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('notice message'))
  ).toBe(true)
})

test('logs warning message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.warning('warning message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('warning message'))
  ).toBe(true)
})

test('logs error message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.error('error message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('error message'))
  ).toBe(true)
})

test('logs critical message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.critical('critical message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('critical message'))
  ).toBe(true)
})

test('logs alert message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.alert('alert message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('alert message'))
  ).toBe(true)
})

test('logs emergency message to console', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.emergency('emergency message')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('emergency message'))
  ).toBe(true)
})

test('logs message with context data (object)', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.info('custom message', { name: 'Marcus', app: 'Supercharge' })

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => {
      return message.includes('custom message {"name":"Marcus","app":"Supercharge"}')
    })
  ).toBe(true)
})

test('handles errors and shows stacktraces', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger()
  logger.alert(new Error('Logging failed'))

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('Logging failed'))
  ).toBe(true)
})

test('honors the log level', async () => {
  const consoleLogStub = Sinon.stub(process.stdout, 'write').returns(() => {})

  const logger = new ConsoleLogger({ level: 'emergency' })
  logger.debug('should not appear')
  logger.emergency('this message should appear')

  consoleLogStub.restore()

  expect(consoleLogStub.called).toBe(true)
  expect(
    !!consoleLogStub.args[0].find(message => message.includes('should not appear'))
  ).toBe(false)

  expect(
    !!consoleLogStub.args[0].find(message => message.includes('this message should appear'))
  ).toBe(true)
})

test.run()
