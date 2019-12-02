'use strict'

const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const QueueWorker = require('../../../queue/worker')

class SqsJobTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(WorkerTestingJob)
  }

  _getWorker () {
    return new QueueWorker(
      this._getWorkerOptions()
    )
  }

  _getWorkerOptions () {
    // TODO
  }

  async jobIsFired (t) {
    const worker = this._getWorker()
    await worker.getNextJob()
  }
}

class WorkerTestingJob {
  async handle () {
    //
  }
}

module.exports = new SqsJobTest()
