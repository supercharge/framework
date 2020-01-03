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
    Queue.addJob(FailingTestingSyncJob)
    Queue.addJob(FailingTestingSyncJobWithoutFailedMethod)
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

  beforeEach () {
    this.failed = false
    this.succeeded = false
  }

  async connect (t) {
    const queue = new SyncQueue()
    t.is(queue, queue.connect())
  }

  async disconnect (t) {
    const queue = new SyncQueue()
    t.is(await queue.disconnect(), undefined)
  }

  async serialHandlesSyncJobImmediately (t) {
    const queue = new SyncQueue()
    await queue.push(TestingSyncJob, this)

    t.false(this.failed)
    t.true(this.succeeded)
  }

  async serialCallsFailMethodImmediately (t) {
    const queue = new SyncQueue()
    try {
      this.failed = false
      await queue.push(FailingTestingSyncJob, this)
    } catch (error) {
      t.true(this.failed)
      t.false(this.succeeded)
    }
  }

  async serialNotCallingFailMethod (t) {
    const queue = new SyncQueue()
    try {
      this.failed = false
      await queue.push(FailingTestingSyncJobWithoutFailedMethod, this)
    } catch (error) {
      t.false(this.failed)
      t.false(this.succeeded)
    }
  }

  async popIsAlwaysEmpty (t) {
    const queue = new SyncQueue()
    await queue.push(TestingSyncJob, this)
    t.is(await queue.pop(), undefined)
  }

  async sizeIsAlwaysZero (t) {
    const queue = new SyncQueue()
    await queue.push(TestingSyncJob, this)
    t.is(await queue.size(), 0)
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
    throw new Error('sync job error')
  }

  async failed () {
    this.test._setFailed()
  }
}

class FailingTestingSyncJobWithoutFailedMethod {
  constructor (test) {
    this.test = test
  }

  async handle () {
    throw new Error('sync job error')
  }

  get failed () {
    return 'failed'
  }
}

module.exports = new SyncQueueTest()
