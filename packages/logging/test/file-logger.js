'use strict'

const Path = require('path')
const { test } = require('uvu')
const { expect } = require('expect')
const Fs = require('@supercharge/fs')
const { FileLogger } = require('../dist/file-logger')

const logFile = Path.resolve(__dirname, 'test.log')

function logWrite () {
  return new Promise(resolve => {
    // wait for the first log flushing down to the file
    setTimeout(resolve, 50)
  })
}

test.before(async () => {
  await Fs.ensureFile(logFile)

  const logger = new FileLogger({ path: logFile })
  logger.info('starting tests')
})

test.after(async () => {
  await Fs.removeFile(logFile)
})

test('logs debug message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.debug('debug message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('debug message')
})

test('logs info message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.info('info message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('info message')
})

test('logs notice message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.notice('notice message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('notice message')
})

test('logs warning message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.warning('warning message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('warning message')
})

test('logs error message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.error('error message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('error message')
})

test('logs critical message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.critical('critical message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('critical message')
})

test('logs alert message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.alert('alert message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('alert message')
})

test('logs emergency message to file', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.emergency('emergency message')

  await logWrite()

  expect(await Fs.content(logFile)).toContain('emergency message')
})

test('logs message with context data (object)', async () => {
  const logger = new FileLogger({ path: logFile })
  logger.info('custom message', { name: 'Marcus' })

  await logWrite()

  const content = await Fs.content(logFile)
  expect(content).toContain('"message":"custom message"')
  expect(content).toContain('"name":"Marcus"')
})

test('honors the log level', async () => {
  const logger = new FileLogger({ level: 'warning', path: logFile })
  logger.debug('should not appear')

  await logWrite()

  expect(await Fs.content(logFile)).not.toContain('should not appear')

  logger.warning('this warning should appear')

  const content = await Fs.content(logFile)
  expect(content).toContain('"message":"this warning should appear"')
  expect(content).toContain('"level":"warning"')
})

test('throws for missing log file path', async () => {
  expect(() => new FileLogger()).toThrow('Missing log file path')
  expect(() => new FileLogger({ path: '' })).toThrow('Missing log file path')
  expect(() => new FileLogger({ path: null })).toThrow('Missing log file path')
})

test.run()
