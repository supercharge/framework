'use strict'

const Queue = require('../../../queue')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const SyncQueue = require('../../../queue/connections/sync-queue')

class SyncQueueTest extends BaseTest {
  constructor () {
    super()

    this.failed = false
    this.succeeded = false
    Queue.addJob(TestingSyncJob)
  }

  _setSucceeded () {
    this.succeeded = true
  }

  _setFailed () {
    this.failed = true
  }

  async before () {
    Config.set('queue.driver', 'sync')
  }

  async serialResolvableDefaultConnection (t) {
    const queue = new SyncQueue()
    await queue.push(TestingSyncJob, this)

    t.false(this.failed)
    t.true(this.succeeded)
  }
}

class TestingSyncJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    this.test._setSucceeded()
  }
}

class FailingTestingSyncJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    this.test.setFailed()
  }
}

module.exports = new SyncQueueTest()
