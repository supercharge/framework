'use strict'

const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const Job = require('../../../queue/jobs/job')
const QueueWorker = require('../../../queue/worker')
const WorkerOptions = require('../../../queue/worker-options')

class QueueWorkerTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(WorkerTestingJob)
  }

  _getWorker (connectionName = 'default', queues, jobs = [new WorkerTestingJob()]) {
    const worker = new QueueWorker(
      this._getWorkerOptions(connectionName, queues)
    )

    // set dependencies
    worker.manager = new TestingQueueManager(connectionName, new TestingQueue(jobs))

    return worker
  }

  _getWorkerOptions (connectionName = 'default', queues) {
    return new WorkerOptions({
      queues,
      connection: connectionName,
      maxAttempts: 0 // unlimited
    })
  }

  async jobFires (t) {
    const worker = this._getWorker()
    const job = await worker.getNextJob()

    const mock = this.mock(job)
    mock.expects('fire').once().resolves()
    mock.expects('fail').never().resolves()

    await worker.handle(job)

    mock.restore()
    mock.verify()

    t.pass()
  }
}

class WorkerTestingJob extends Job {
  async handle () {
    //
  }

  attempts () {
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

  connection (name) {
    return this.connections[name]
  }

  stop () {
    //
  }
}

module.exports = new QueueWorkerTest()
