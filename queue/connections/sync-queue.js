'use strict'

const SyncJob = require('../jobs/sync-job')

class SyncQueue {
  /**
   * Create a queue connection.
   *
   * @returns {SyncQueue}
   */
  connect () {
    return this
  }

  /**
   * Close an existing queue connection.
   */
  disconnect () { }

  /**
   * Push a new job onto the queue.
   *
   * @param {Class} job
   * @param {*} data
   */
  async push (job, data) {
    const queueJob = new SyncJob(job, data)

    try {
      await queueJob.fire()
    } catch (error) {
      await queueJob.fail(error)
      throw error
    }

    return queueJob.id()
  }

  /**
   * Retrieve the next job from the queue.
   */
  async pop () { }

  /**
   * The synchrounous queue processes all jobs
   * immediately. There’s never a job enqueued.
   */
  async size () {
    return 0
  }

  /**
   * Clears all jobs from all queues.
   */
  async clear () { }
}

module.exports = SyncQueue
