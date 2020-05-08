'use strict'

const Queue = require('../../../queue')
const Logger = require('../../../logging')
const BaseTest = require('../../../base-test')
const Job = require('../../../queue/jobs/job')
const QueueWorker = require('../../../queue/worker')
const WorkerOptions = require('../../../queue/worker-options')

class QueueWorkerTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(WorkerTestingJob)
  }

  _getWorker ({ options, connectionName = 'default', queues = 'default', jobs = [new WorkerTestingJob()] } = {}) {
    jobs.forEach(job => {
      Queue.addJob(job.constructor)
    })

    const worker = new QueueWorker(
      this._getWorkerOptions({ options, connectionName, queues })
    )

    // set dependencies
    worker.manager = new TestingQueueManager(connectionName, new TestingQueue(jobs))

    return worker
  }

  _getWorkerOptions ({ options, connectionName, queues }) {
    return new WorkerOptions({
      queues,
      connection: connectionName,
      maxAttempts: 0, // unlimited
      ...options
    })
  }

  async canFireJob (t) {
    const worker = this._getWorker()
    const job = await worker.getNextJob()

    const mock = this.mock(job)
    mock.expects('fire').once().resolves()
    mock.expects('fail').never().resolves()

    await worker.process(job)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async stopsWhenWorkerShouldStop (t) {
    const worker = this._getWorker()
    t.false(worker.shouldStop)

    worker.stop()
    t.true(worker.shouldStop)
  }

  async releaseBackOnException (t) {
    class WorkerTestingFailJob extends TestingBaseJob {
      async handle () {
        throw new Error('failing job')
      }

      maxAttempts () {}
    }

    const job = new WorkerTestingFailJob()
    const worker = this._getWorker({ jobs: [job] })

    const spy = this.spy(Logger, 'error')
    const mock = this.mock(job)

    mock.expects('releaseBack').once().resolves()

    await worker.process(job)

    mock.restore()
    mock.verify()

    t.true(spy.called)
    spy.restore()
  }

  async releaseBackWhenNotExceedingJobMaxAttempts (t) {
    class FailingJob extends TestingBaseJob {
      async handle () {
        throw new Error('failing job')
      }

      attempts () {
        return 1
      }

      maxAttempts () {
        return 3
      }
    }

    const job = new FailingJob()
    const worker = this._getWorker({ jobs: [job] })

    const mock = this.mock(job)

    mock.expects('fail').never().resolves()
    mock.expects('releaseBack').once().resolves()

    await worker.process(job)

    mock.restore()
    mock.verify()

    t.true(job.hasNotFailed())
  }

  async shouldFailDueToExceededMaxAttempts (t) {
    class FailDueToExceededMaxAttemptsJob extends TestingBaseJob {
      handle () { }

      attempts () {
        return 20
      }

      maxAttempts () { }
    }

    const job = new FailDueToExceededMaxAttemptsJob()
    const worker = this._getWorker({ options: { maxAttempts: 1 }, jobs: [job] })

    await worker.process(job)

    t.true(job.isDeleted())
  }

  async shouldFailWhenExceedingMaxAttempts (t) {
    class FailWhenExceedingMaxAttemptsJob extends TestingBaseJob {
      handle () { }

      attempts () {
        return 1
      }

      maxAttempts () { }
    }

    const job = new FailWhenExceedingMaxAttemptsJob()
    const worker = this._getWorker({ options: { maxAttempts: 2 }, jobs: [job] })

    await worker.process(job)

    t.true(job.isDeleted())
  }

  async doesNotFireWhenDeleted (t) {
    class DoesNotFireWhenDeletedJob extends TestingBaseJob {
      handle () { }
      maxAttempts () {}
    }

    const job = new DoesNotFireWhenDeletedJob()
    job.delete()

    const worker = this._getWorker({ jobs: [job] })

    const mock = this.mock(job)
    mock.expects('fire').never().resolves()

    await worker.process(job)

    mock.restore()
    mock.verify()

    t.true(job.isDeleted())
  }

  async handlesRetries (t) {
    class RetryJob extends TestingBaseJob {
      handle () { }

      attempts () {
        return 2
      }

      maxAttempts () {}
    }

    const job = new RetryJob()
    const worker = this._getWorker({ options: { maxAttempts: 5 }, jobs: [job] })

    const mock = this.mock(job)
    mock.expects('fire').once().resolves()

    await worker.process(job)

    mock.restore()
    mock.verify()

    t.pass()
  }

  async startsLongPolling (t) {
    const worker = this._getWorker()

    const mock = this.mock(worker)
    mock.expects('workHardPollHard').once().resolves()

    await worker.longPoll()
    await new Promise(resolve => setTimeout(resolve, 1))

    mock.restore()
    mock.verify()

    t.pass()
  }

  async sleepsOneSecondWhenNoJobAvailable (t) {
    const worker = this._getWorker({
      jobs: [
        new WorkerTestingJob(),
        new WorkerTestingJob()
      ]
    })

    const getNextJobSpy = this.spy(worker, 'getNextJob')
    const sleepSecondsSpy = this.spy(worker, 'sleepSeconds')

    await worker.workHardPollHard()
    await new Promise(resolve => setTimeout(resolve, 1100))

    t.true(getNextJobSpy.called)
    t.true(sleepSecondsSpy.calledWith(0))
    t.true(sleepSecondsSpy.calledWith(1))

    getNextJobSpy.restore()
    sleepSecondsSpy.restore()
  }

  async notPollingForJobsWhenWorkerShouldStop (t) {
    const worker = this._getWorker()
    await worker.stop()

    const getNextJobSpy = this.spy(worker, 'getNextJob')

    await worker.workHardPollHard()

    t.true(getNextJobSpy.notCalled)

    getNextJobSpy.restore()
  }
}

class TestingBaseJob extends Job {
  payload () {
    return {}
  }

  failed () {
    // do nothing
  }

  jobName () {
    return this.constructor.name
  }
}

class WorkerTestingJob extends TestingBaseJob {
  async handle () {
    //
  }

  maxAttempts () {
    return 0
  }
}

class TestingQueue {
  constructor (jobs) {
    this.jobs = [].concat(jobs)
  }

  async pop () {
    return this.jobs.pop()
  }
}

class TestingQueueManager {
  constructor (name, connection) {
    this.connections = {
      [name]: connection
    }
  }

  getJob (jobName) {
    return Queue.getJob(jobName)
  }

  connection (name) {
    return this.connections[name]
  }

  stop () {
    //
  }
}

module.exports = new QueueWorkerTest()
