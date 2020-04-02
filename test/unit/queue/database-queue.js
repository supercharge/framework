'use strict'

const Queue = require('../../../queue')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const MongooseJob = require('../../../queue/jobs/mongoose-job')
const DatabaseQueue = require('../../../queue/connections/database-queue')

class DatabaseQueueTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(TestingDatabaseJob)

    this.queue = 'supercharge-database-testing'

    Config.set('database.default', 'mongoose')
    Config.set('database.connections', {
      mongoose: {
        host: 'localhost',
        database: 'supercharge-testing',
        options: { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
      }
    })

    this.config = {
      queue: this.queue
    }

    this.mockPayload = { name: 'Marcus' }
    this.mockJob = { id: 'job-id', jobClassName: 'TestingDatabaseJob' }
  }

  async beforeEach () {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    let job = await queue.pop()

    while (job) {
      if (job) await job.delete()
      job = await queue.pop()
    }
  }

  async serialDatabaseQueueConnect (t) {
    const queue = new DatabaseQueue(this.config)
    t.is(queue, await queue.connect())
  }

  async serialDatabaseQueueDisconnect (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()
    t.is(await queue.disconnect(), undefined)
  }

  async serialDatabaseQueuePush (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    const id = await queue.push(TestingDatabaseJob, this.mockPayload)
    t.truthy(id)
    t.is(1, await queue.size())
  }

  async serialDatabaseQueuePop (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingDatabaseJob, this.mockPayload)

    const job = await queue.pop()
    t.true(job instanceof MongooseJob)
  }

  async serialDatabaseQueuePopNull (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    const job = await queue.pop()

    t.not(job instanceof MongooseJob)
    t.is(job, null)
  }

  async serialDatabaseQueueSize (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingDatabaseJob, this.mockPayload)
    await queue.push(TestingDatabaseJob, this.mockPayload)
    await queue.push(TestingDatabaseJob, this.mockPayload)
    t.is(3, await queue.size())

    await queue.pop()
    t.is(2, await queue.size())

    await queue.pop()
    await queue.pop()
    t.is(0, await queue.size())
  }

  async serialDatabaseQueueClear (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingDatabaseJob, this.mockPayload)
    await queue.push(TestingDatabaseJob, this.mockPayload)
    await queue.push(TestingDatabaseJob, this.mockPayload)
    t.is(3, await queue.size())

    await queue.clear()
    t.is(0, await queue.size())
  }

  async throwsWhenUsingUnknownDatabaseClient (t) {
    Config.set('database.default', 'not-existent')
    const queue = new DatabaseQueue(this.config)

    const error = await t.throwsAsync(async () => queue.pop())
    t.true(error.message.includes('Unknown database queue driver'))
  }
}

class TestingDatabaseJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    //
  }
}

module.exports = new DatabaseQueueTest()
