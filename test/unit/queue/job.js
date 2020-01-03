'use strict'

const Job = require('../../../queue/jobs/job')
const BaseTest = require('../../../base-test')

class QueueJobTest extends BaseTest {
  async retrievesAttempts (t) {
    const job = new TestingJob()
    t.is(job.attempts(), 1)
  }
}

class TestingJob extends Job {
  async handle () {
    //
  }

  payload () {
    return {
      attempts: 1
    }
  }
}

module.exports = new QueueJobTest()
