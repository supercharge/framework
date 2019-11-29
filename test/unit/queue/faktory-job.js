'use strict'

const Uuid = require('uuid/v4')
const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const FaktoryJob = require('../../../queue/jobs/faktory-job')
const FaktoryMockServer = require('./fixtures/faktory-server')
const FaktoryQueue = require('../../../queue/connections/faktory-queue')

class FaktoryJobTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(TestingFaktoryJob)

    this.faktoryClient = null
    this.faktoryServer = null

    this.jobId = Uuid()
    this.queue = 'supercharge-testing'

    this.mockPayload = { name: 'Marcus' }

    this.mockJob = {
      jid: this.jobId,
      custom: { attempts: 1001 },
      args: [this.mockPayload],
      jobtype: 'TestingFaktoryJob'
    }

    this.mockInfo = {
      queues: {
        [this.queue]: 101
      }
    }
  }

  async before () {
    this.faktoryServer = new FaktoryMockServer()
    await this.faktoryServer.start()

    const queue = new FaktoryQueue({
      queue: this.queue,
      port: this.faktoryServer.port()
    })

    await queue.connect()

    this.faktoryClient = queue.client
  }

  async alwaysAfter () {
    await this.faktoryServer.stop()
  }

  _createJob () {
    return new FaktoryJob(this.mockJob, this.faktoryClient, this.queue)
  }

  async fireAJobCallsHandleMethodAndDeletesJobFromQueue (t) {
    const job = this._createJob()
    const mock = this.mock(job.client)

    mock
      .expects('ack')
      .once()
      .withArgs(this.mockJob.jid)
      .resolves()

    await job.fire()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialReleaseJobBack (t) {
    const job = this._createJob()
    const mock = this.mock(job.client)

    mock
      .expects('ack')
      .once()
      .withArgs(this.mockJob.jid)
      .resolves()

    mock
      .expects('push')
      .resolves()

    await job.releaseBack(1)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialReleaseJobBackWithDefaultTimeout (t) {
    const job = this._createJob()
    const mock = this.mock(job.client)

    mock
      .expects('ack')
      .once()
      .withArgs(this.mockJob.jid)
      .resolves()

    mock
      .expects('push')
      .resolves()

    await job.releaseBack()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialFailed (t) {
    const job = this._createJob()
    const mock = this.mock(job.client)

    mock
      .expects('ack')
      .once()
      .withArgs(this.mockJob.jid)
      .resolves()

    await job.failed()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async attempts (t) {
    const job = this._createJob()
    t.is(job.attempts(), 1001)
  }

  async serialJobId (t) {
    const job = this._createJob()
    t.is(job.id(), this.jobId)
  }
}

class TestingFaktoryJob {
  async handle () {
    //
  }
}

module.exports = new FaktoryJobTest()
