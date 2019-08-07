'use strict'

const _ = require('lodash')
const AWS = require('aws-sdk')
const SqsClient = AWS.SQS
const SqsJob = require('../jobs/sqs-job')
const Collect = require('@supercharge/collections')

class SqsQueue {
  constructor (config) {
    this.client = null
    this.config = config
  }

  /**
   * Returns the AWS queue prefix representing the queue
   * URL including the account id. Here's an example:
   * `https://sqs.eu-central-1.amazonaws.com/account-id`
   *
   * @returns {String}
   */
  get prefix () {
    return this.config.prefix
  }

  /**
   * Returns the default queue name.
   *
   * @returns {String}
   */
  get defaultQueue () {
    return this.config.queue
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
    const response = await this.client.sendMessage({
      QueueUrl: this.queueUrlFor(queue),
      MessageBody: this.createPayload(job, data)
    }).promise()

    return response.MessageId
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue) {
    const response = await this.client.receiveMessage({
      QueueUrl: this.queueUrlFor(queue),
      AttributeNames: []
    }).promise()

    const messages = response.Messages

    console.log(messages)

    return await Collect(messages).isNotEmpty()
      ? new SqsJob(messages[0], this.client, this.queueUrlFor(queue))
      : null
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queues
   *
   * @returns {Number}
   */
  async size (queue) {
    const response = await this.client.getQueueAttributes({
      QueueUrl: this.queueUrlFor(queue),
      AttributeNames: ['ApproximateNumberOfMessages']
    }).promise()

    const { ApproximateNumberOfMessages } = response.Attributes

    return parseInt(ApproximateNumberOfMessages)
  }

  /**
   * Create the queue job’s JSON payload
   * based on the job name and data.
   *
   * @param {Class} job
   * @param {*} data
   */
  createPayload (job, data) {
    return JSON.stringify({
      displayName: job.name,
      data
    })
  }

  /**
   * Compose the queue URL for the given
   * `queue` or use the default queue.
   *
   * @param {String} queue
   *
   * @returns {String}
   */
  queueUrlFor (queue = this.defaultQueue) {
    return _.trimEnd(this.prefix, '/').concat('/', queue)
  }
}

module.exports = SqsQueue
