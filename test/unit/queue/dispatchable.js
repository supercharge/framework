'use strict'

const Queue = require('../../../queue')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const BaseJob = require('../../../queue/jobs/job')
const Dispatchable = require('../../../queue/dispatchable')
const QueueBootstrapper = require('../../../queue/bootstrapper')

let data

class QueueJobTest extends BaseTest {
  async before () {
    Config.set('queue.driver', 'sync')

    await Queue.addJob(TestingJob)
    await Queue.addJob(MissingHandleMethod)

    await new QueueBootstrapper().boot()
  }

  beforeEach () {
    data = null
  }

  async dispatchesJobs (t) {
    await TestingJob.dispatch({ name: 'Marcus' })
    t.deepEqual(data, { name: 'Marcus' })
  }

  async serialCanDispatchOnQueueAndConnection (t) {
    const mock = this.mock(Queue)

    mock
      .expects('dispatch')
      .withArgs(TestingJob, {
        data: { name: 'Marcus ' },
        connection: 'testing-connection',
        queue: 'testing-queue'
      })
      .resolves()

    await TestingJob
      .onQueue('testing-queue')
      .onConnection('testing-connection')
      .dispatch({ name: 'Marcus ' })

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialCanDispatchOnConnection (t) {
    const mock = this.mock(Queue)

    mock
      .expects('dispatch')
      .withArgs(TestingJob, {
        data: { name: 'Marcus ' },
        connection: 'testing-connection',
        queue: 'testing-queue'
      })
      .resolves()

    await TestingJob
      .onConnection('testing-connection')
      .onQueue('testing-queue')
      .dispatch({ name: 'Marcus ' })

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialReleaseBackWithJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('releaseBack')
      .withArgs(1)
      .resolves()

    job.setJob(baseJob)
    await job.releaseBack(1)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialReleaseBackWithoutJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('releaseBack')
      .never()
      .resolves()

    await job.releaseBack(1)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialTryAgainIn (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('releaseBack')
      .withArgs(2)
      .resolves()

    job.setJob(baseJob)
    await job.tryAgainIn(2)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialAttemptsWithJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('attempts')
      .resolves()

    job.setJob(baseJob)
    await job.attempts()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialAttemptsWithoutJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('attempts')
      .never()
      .resolves()

    await job.attempts()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialDeleteWithJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('delete')
      .resolves()

    job.setJob(baseJob)
    await job.delete()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialDeleteWithoutJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('delete')
      .never()
      .resolves()

    await job.delete()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialFailedWithJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()
    const error = new Error('job.fail')

    const mock = this.mock(baseJob)

    mock
      .expects('fail')
      .withArgs(error)
      .resolves()

    job.setJob(baseJob)
    await job.fail(error)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async serialFailedWithoutJob (t) {
    const job = new TestingJob()
    const baseJob = this._createBaseJob()

    const mock = this.mock(baseJob)

    mock
      .expects('fail')
      .never()
      .resolves()

    await job.fail()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async throwsDueToMissingHandleMethod (t) {
    await t.throwsAsync(async () => {
      await MissingHandleMethod.dispatch({ name: 'Marcus' })
    })
  }

  _createBaseJob () {
    return new BaseJob()
  }
}

class MissingHandleMethod extends Dispatchable {}

class TestingJob extends Dispatchable {
  constructor (data) {
    super()
    this.data = data
  }

  async handle () {
    data = this.data
  }

  attempts () {
    super.attempts()

    return 0
  }
}

module.exports = new QueueJobTest()
