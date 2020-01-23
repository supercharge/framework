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
  get defaultQueueName () {
    return this.config.queue
  }

  /**
   * Create a queue connection. The SQS client
   * uses HTTP requests to send jobs onto
   * and retrieve them from the queue.
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
      httpOptions: { connectTimeout: 60 },
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
  async disconnect () { }

  /**
   * Push a new job with `data` to process onto the given `queue`.
   *
   * @param {String} jobName
   * @param {*} data
   * @param {String} queueName
   *
   * @returns {*} job ID
   */
  async push (job, data, queueName) {
    const response = await this.client.sendMessage({
      QueueUrl: this.queueUrlFor(queueName),
      MessageBody: this.createPayload(job, data)
    }).promise()

    return response.MessageId
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queueName
   *
   * @returns {Job}
   */
  async pop (queueName) {
    const { Messages: messages } = await this.client.receiveMessage({
      QueueUrl: this.queueUrlFor(queueName),
      AttributeNames: ['ApproximateReceiveCount']
    }).promise()

    return await Collect(messages).isNotEmpty()
      ? new SqsJob(messages[0], this.client, this.queueUrlFor(queueName))
      : null
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queueName
   *
   * @returns {Number}
   */
  async size (queueName) {
    const response = await this.client.getQueueAttributes({
      QueueUrl: this.queueUrlFor(queueName),
      AttributeNames: ['ApproximateNumberOfMessages']
    }).promise()

    return parseInt(response.Attributes.ApproximateNumberOfMessages)
  }

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String} queueName
   */
  async clear (queueName) {
    await this.client.purgeQueue({
      QueueUrl: this.queueUrlFor(queueName)
    }).promise()
  }

  /**
   * Create the queue job’s JSON payload based on the job name and data.
   *
   * @param {Class} job
   * @param {*} data
   */
  createPayload (job, data) {
    return JSON.stringify({
      jobClassName: job.name,
      data
    })
  }

  /**
   * Compose the queue URL for the given `queue` or use the default queue.
   *
   * @param {String} queueName
   *
   * @returns {String}
   */
  queueUrlFor (queueName = this.defaultQueueName) {
    return _.trimEnd(this.prefix, '/').concat('/', queueName)
  }
}

module.exports = SqsQueue
