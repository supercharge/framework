'use strict'

const Path = require('path')
const Fs = require('@supercharge/filesystem')
const { FileLogger } = require('../dist/src/file-logger')

const logFile = Path.resolve(__dirname, 'test.log')

function logWrite () {
  return new Promise(resolve => {
    // wait for the first log flushing down to the file
    setTimeout(resolve, 50)
  })
}

describe.only('File Logger', () => {
  beforeAll(async () => {
    await Fs.ensureFile(logFile)

    const logger = new FileLogger({ path: logFile })
    logger.info('starting tests')
  })

  afterAll(async () => {
    await Fs.removeFile(logFile)
  })

  it('logs debug message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.debug('debug message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('debug message')
  })

  it('logs info message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.info('info message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('info message')
  })

  it('logs notice message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.notice('notice message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('notice message')
  })

  it('logs warning message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.warning('warning message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('warning message')
  })

  it('logs error message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.error('error message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('error message')
  })

  it('logs critical message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.critical('critical message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('critical message')
  })

  it('logs alert message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.alert('alert message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('alert message')
  })

  it('logs emergency message to file', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.emergency('emergency message')

    await logWrite()

    expect(await Fs.readFile(logFile)).toInclude('emergency message')
  })

  it('logs message with context data (object)', async () => {
    const logger = new FileLogger({ path: logFile })
    logger.info('custom message', { name: 'Marcus' })

    await logWrite()

    const content = await Fs.readFile(logFile)
    expect(content).toInclude('"message":"custom message"')
    expect(content).toInclude('"name":"Marcus"')
  })

  it('honors the log level', async () => {
    const logger = new FileLogger({ level: 'warning', path: logFile })
    logger.debug('should not appear')

    await logWrite()

    expect(await Fs.readFile(logFile)).not.toInclude('should not appear')

    logger.warning('this warning should appear')

    const content = await Fs.readFile(logFile)
    expect(content).toInclude('"message":"this warning should appear"')
    expect(content).toInclude('"level":"warning"')
  })
})
