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
  constructor ({ connection, queues, maxAttempts }) {
    this._queues = [].concat(queues)
    this._connectionName = connection
    this._maxAttempts = parseInt(maxAttempts)
  }

  /**
   * Returns the name of the queue connection to fetch jobs from.
   *
   * @returns {String}
   */
  get connectionName () {
    return this._connectionName
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
   * Returns the maximum number of attempts to
   * process a job before marking it failed.
   *
   * @returns {Number}
   */
  get maxAttempts () {
    return this._maxAttempts
  }
}

module.exports = WorkerOptions
