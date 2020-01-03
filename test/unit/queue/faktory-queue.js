'use strict'

const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const FaktoryJob = require('../../../queue/jobs/faktory-job')
const FaktoryMockServer = require('./fixtures/faktory-server')
const FaktoryQueue = require('../../../queue/connections/faktory-queue')

class FaktoryQueueTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(TestingFaktoryJob)

    this.queue = 'supercharge-testing'
    this.faktoryServer = new FaktoryMockServer()

    this.mockPayload = { name: 'Marcus' }

    this.mockJob = { jid: '1234', jobtype: 'TestingFaktoryJob' }
    this.mockInfo = {
      queues: {
        [this.queue]: 101
      }
    }
  }

  async before () {
    await this.faktoryServer.start()

    this.config = {
      queue: this.queue,
      port: this.faktoryServer.port()
    }
  }

  async alwaysAfter () {
    await this.faktoryServer.stop()
  }

  async serialFaktoryConnect (t) {
    const queue = new FaktoryQueue(this.config)
    t.is(queue, await queue.connect())

    t.pass()
  }

  async serialFaktoryDisconnect (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    t.is(await queue.disconnect(), undefined)
  }

  async serialFaktoryPush (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    const mock = this.mock(queue.client)

    mock
      .expects('push')
      .once()
      .withArgs({
        queue: this.queue,
        custom: { attempts: 0 },
        args: [this.mockPayload],
        jobtype: 'TestingFaktoryJob'
      })
      .returns(this.mockJob.jid)

    const id = await queue.push(TestingFaktoryJob, this.mockPayload)

    mock.restore()
    mock.verify()

    t.is(id, this.mockJob.jid)
  }

  async serialFaktoryPop (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    const mock = this.mock(queue.client)

    mock
      .expects('fetch')
      .once()
      .withArgs(this.queue)
      .returns(this.mockJob)

    const job = await queue.pop()

    mock.restore()
    mock.verify()

    t.true(job instanceof FaktoryJob)
  }

  async serialFaktoryPopNull (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    const mock = this.mock(queue.client)

    mock
      .expects('fetch')
      .once()
      .withArgs(this.queue)
      .returns(null)

    const job = await queue.pop()

    mock.restore()
    mock.verify()

    t.not(job instanceof FaktoryJob)
    t.is(job, null)
  }

  async serialFaktorySize (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    const mock = this.mock(queue.client)

    mock
      .expects('info')
      .once()
      .returns(this.mockInfo)

    const size = await queue.size()

    mock.restore()
    mock.verify()

    t.is(size, 101)
  }
}

class TestingFaktoryJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    this.test._setSucceeded()
  }
}

module.exports = new FaktoryQueueTest()
