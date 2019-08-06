'use strict'

class WorkerOptions {
  /**
     * Create a new instance of worker options. This class
     * aims to provide convenient access to individual
     * options for a queue worker instance.
     *
     * @param {options} worker options
     *
     * @returns {WorkerOptions}
     */
  constructor ({ connection, queues, shutdownTimeout }) {
    this._connection = connection
    this._queues = [].concat(queues || 'default')
    this._shutdownTimeout = (Number(shutdownTimeout) || 10) * 1000
  }

  /**
   * Returns the name of the queue connection to fetch jobs from.
   *
   * @returns {String}
   */
  get connection () {
    return this._connection
  }

  /**
   * Returns an array of queues to process.
   *
   * @returns {Array}
   */
  get queues () {
    return this._queues
  }

  /**
   * Returns the shutdown timeout in milliseconds which
   * represents the time interval before forcefully
   * shutting down the queue connection.
   *
   * @returns {Number}
   */
  get shutdownTimeout () {
    return this._shutdownTimeout
  }
}

module.exports = WorkerOptions
