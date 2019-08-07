'use strict'

const AWS = require('aws-sdk')
const SqsClient = AWS.SQS

class SqsQueue {
  constructor (config) {
    this.client = null
    this.config = config
  }

  /**
   * Create a queue connection.
   *
   * @param {Object} config
   *
   * @returns {SqsQueue}
   */
  async connect () {
    this.client = new SqsClient(
      this.createConfiguration()
    )

    return this
  }

  /**
   * Composes and returns the AWS SQS configuration.
   *
   * @param {Object} config
   *
   * @returns {Object}
   */
  createConfiguration () {
    return Object.assign({
      version: 'latest',
      httpOptions: {
        connectTimeout: 60
      },
      credentials: this.createCredentials()
    }, this.config)
  }

  /**
   * Create an AWS credentials instance based
   * on the configured access key, secret,
   * and token.
   *
   * @returns {AWS.Credentials} AWS.Credentials
   */
  createCredentials () {
    const { key, secret, token } = this.config

    return new AWS.Credentials(key, secret, token)
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
