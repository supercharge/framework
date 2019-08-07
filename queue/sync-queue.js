'use strict'

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
    // TODO
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
}

module.exports = SyncQueue
