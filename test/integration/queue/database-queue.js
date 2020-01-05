'use strict'

const Uuid = require('uuid/v4')
const Queue = require('../../../queue')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const Worker = require('../../../queue/worker')
const WorkerOptions = require('../../../queue/worker-options')
const MongooseJob = require('../../../queue/jobs/mongoose-job')
const QueueBootstrapper = require('../../../queue/bootstrapper')
const DatabaseQueue = require('../../../queue/connections/database-queue')

let handled = false
let failed = false
let error = null

class MongooseJobTest extends BaseTest {
  constructor () {
    super()

    this.jobId = Uuid()
    this.queue = 'database-queue-integration-test'

    this.config = {
      queue: this.queue
    }

    Config.set('queue.connections.database', {
      queue: 'default',
      table: 'queue-jobs'
    })
    Config.set('database.default', 'mongoose')
    Config.set('database.connections', {
      mongoose: {
        host: 'localhost',
        database: 'supercharge-testing',
        options: { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
      }
    })

    this.mockPayload = { name: 'Marcus' }
  }

  async before () {
    await new QueueBootstrapper().boot()
    Queue.addJob(TestingMongooseJob)
    Queue.addJob(FailingTestingJob)
  }

  async beforeEach () {
    await this._deleteOldJobs()

    handled = false
    failed = false
    error = null
  }

  async _deleteOldJobs (config) {
    const queue = new DatabaseQueue(config || this.config)
    await queue.connect()

    let job = await queue.pop()

    while (job) {
      if (job) {
        await job.delete()
      }

      job = await queue.pop()
    }
  }

  async serialPushAndPopJob (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingMongooseJob, this.mockPayload)

    const job = await queue.pop()
    t.not(job, null)
    t.true(job instanceof MongooseJob)

    t.truthy(job.id())
    t.truthy(job.jobName())
    t.is(job.attempts(), 0)
    t.deepEqual(job.payload(), this.mockPayload)
  }

  async serialReleaseJobBackAndIncreaseAttempts (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingMongooseJob, this.mockPayload)

    let job = await queue.pop()
    await job.releaseBack()

    job = await queue.pop()
    t.is(job.attempts(), 1)
  }

  async serialHandleSuccessJob (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(TestingMongooseJob, this.mockPayload)

    const worker = new Worker(
      new WorkerOptions({ connection: 'database', queues: [this.queue], maxAttempts: 0 })
    )

    const stub = this.stub(worker, 'sleep').returns()

    await worker.workHardPollHard()
    t.true(handled)
    t.false(failed)
    t.is(await queue.size(), 0)

    await worker.stop()

    stub.restore()
  }

  async serialHandleFailingJob (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    await queue.push(FailingTestingJob, this.mockPayload, this.queue)

    const worker = new Worker(
      new WorkerOptions({ connection: 'database', queues: [this.queue], maxAttempts: 2 })
    )

    const stub = this.stub(worker, 'sleep').returns()

    await worker.workHardPollHard()
    t.false(failed)
    t.false(handled)
    t.is(await queue.size(), 1) // job should be released back onto the queue

    await worker.workHardPollHard()
    t.true(failed)
    t.false(handled)
    t.is(await queue.size(), 0) // job failed, not released back
    t.is(error.message, 'failed in database queue test')

    await worker.stop()

    stub.restore()
  }

  async serialWorkerHandlesJobsOnSpecificQueue (t) {
    const queue = new DatabaseQueue(this.config)
    await queue.connect()

    const differentQueueName = `${this.queue}-diff`

    await queue.push(TestingMongooseJob, this.mockPayload, differentQueueName)
    await queue.push(TestingMongooseJob, this.mockPayload, differentQueueName)

    const workerOnDefaultQueue = new Worker(
      new WorkerOptions({ connection: 'database', queues: [this.queue], maxAttempts: 1 })
    )

    const defaultWorkerStub = this.stub(workerOnDefaultQueue, 'sleep').returns()

    await workerOnDefaultQueue.workHardPollHard()
    t.is(await queue.size(differentQueueName), 2)
    await workerOnDefaultQueue.workHardPollHard()
    t.is(await queue.size(differentQueueName), 2)

    const worker = new Worker(
      new WorkerOptions({ connection: 'database', queues: [differentQueueName], maxAttempts: 1 })
    )

    const workerStub = this.stub(worker, 'sleep').returns()

    await worker.workHardPollHard()
    t.is(await queue.size(differentQueueName), 1)
    await worker.workHardPollHard()
    t.is(await queue.size(differentQueueName), 0)

    await worker.stop()
    await workerOnDefaultQueue.stop()

    workerStub.restore()
    defaultWorkerStub.restore()
  }
}

class TestingMongooseJob {
  async handle () {
    handled = true
  }
}

class FailingTestingJob {
  async handle () {
    throw new Error('failed in database queue test')
  }

  async failed (err) {
    failed = true
    error = err
  }
}

module.exports = new MongooseJobTest()
