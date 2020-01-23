'use strict'

const Str = require('@supercharge/strings')
const PendingDispatch = require('./pending-dispatch')
const InteractsWithQueue = require('./interacts-with-queue')

class Dispatchable extends InteractsWithQueue {
  /**
   * Every queue job should extend this class to
   * conveniently dispatch jobs onto queues.
   */
  constructor () {
    super()

    this.id = Str.uuid()
    this.queue = null
    this.connection = null
  }

  /**
   * Dispatch the job with the given `data`.
   *
   * @param {*} data
   *
   * @returns {PendingDispatch}
   */
  static async dispatch (data) {
    return new PendingDispatch(this).dispatch(data)
  }

  /**
   * Set the queue name for the job.
   *
   * @param {String} queue
   *
   * @returns {PendingDispatch}
   */
  static onQueue (queue) {
    return new PendingDispatch(this).onQueue(queue)
  }

  /**
   * Set the queue connection name for the job.
   *
   * @param {String} queue
   *
   * @returns {PendingDispatch}
   */
  static onConnection (connection) {
    return new PendingDispatch(this).onConnection(connection)
  }
}

module.exports = Dispatchable
