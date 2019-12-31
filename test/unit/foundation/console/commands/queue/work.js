'use strict'

const Config = require('../../../../../../config')
const BaseTest = require('../../../../../../base-test')
const QueueWorkCommand = require('../../../../../../console/commands/queue/work')

class QueueWorkCommandTest extends BaseTest {
  before () {
    Config.set('database.default', 'mongoose')
    this.processExitStub = this.stub(process, 'exit')
  }

  beforeEach () {
    this.command = new QueueWorkCommand()
    this.inProjectRootStub = this.stub(this.command, 'ensureInProjectRoot').returns(true)
  }

  alwaysAfterEach () {
    this.inProjectRootStub.restore()
  }

  alwaysAfter () {
    this.processExitStub.restore()
  }

  async signature (t) {
    t.true(QueueWorkCommand.signature.includes('queue:work'))
    t.true(QueueWorkCommand.signature.includes('connection?'))
    t.true(QueueWorkCommand.signature.includes('--queue'))
    t.true(QueueWorkCommand.signature.includes('--attempts'))
  }

  async description (t) {
    t.true(QueueWorkCommand.description.includes('Start the queue worker'))
  }

  async serialStartStopWorker (t) {
    await this.command.handle({ }, { })
    t.truthy(this.command.worker)
    t.false(this.command.worker.shouldStop)

    process.emit('SIGINT')
    t.true(this.command.worker.shouldStop)

    await new Promise(resolve => setTimeout(resolve, 10))
    t.true(this.processExitStub.called)
  }

  async serialStopWorkerOnSigterm (t) {
    await this.command.handle({ }, { })
    t.false(this.command.worker.shouldStop)

    process.emit('SIGTERM')
    t.true(this.processExitStub.called)
  }

  async createsWorkerOptions (t) {
    await this.command.createWorker({ connection: 'test-con' }, { queue: 'test-q', attempts: 100 })

    const options = this.command.worker.options
    t.deepEqual(options.queues, ['test-q'])
    t.deepEqual(options.maxAttempts, 100)
    t.deepEqual(options.connectionName, 'test-con')
  }
}

module.exports = new QueueWorkCommandTest()
