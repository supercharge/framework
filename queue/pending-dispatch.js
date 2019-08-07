'use strict'

const QueueManager = require('.')

class PendingDispatch {
  /**
   * This class represents an intermediate state of
   * a queue job that can be further modified on
   * where to dispatch the actual job.
   *
   * @param {Dispatchable} dispatchable
   */
  constructor (dispatchable) {
    this.queue = undefined
    this.connection = undefined
    this.dispatchable = dispatchable
  }

  /**
   * Dispatch the job with the given `data`.
   *
   * @param {*} data
   */
  async dispatch (data) {
    return QueueManager.dispatch(this.dispatchable, {
      data,
      queue: this.queue,
      connection: this.connection
    })
  }

  /**
   * Set the queue name for the job.
   *
   * @param {String} queue
   *
   * @returns {PendingDispatch}
   */
  onQueue (queue) {
    this.queue = queue

    return this
  }

  /**
   * Set the queue connection name for the job.
   *
   * @param {String} queue
   *
   * @returns {PendingDispatch}
   */
  onConnection (connection) {
    this.connection = connection

    return this
  }
}

module.exports = PendingDispatch
