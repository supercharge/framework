'use strict'

const SqsClient = require('aws-sdk/clients/sqs')

class SqsQueue {
  constructor () {
    this.client = null
  }

  /**
   * Create a queue connection.
   *
   * @param {Object} config
   *
   * @returns {SqsQueue}
   */
  async connect (config) {
    this.client = new SqsClient(config)
  }

  /**
   * Close an existing queue connection.
   */
  async disconnect () {
    // TODO
  }

  /**
   * Push a new job with `data` to process
   * onto the given `queue`.
   *
   * @param {String} jobName
   * @param {*} data
   * @param {String} queue
   */
  async push (job, data, queue) {
    // TODO
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue) {
    // TODO
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queues
   *
   * @returns {Number}
   */
  async size (queue) {
    // TODO
  }
}

module.exports = SqsQueue
