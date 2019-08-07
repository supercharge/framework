'use strict'

const Job = require('./job')

class SqsJob extends Job {
  constructor (job, client, queueUrl) {
    super(job)

    this.client = client
    this.queueUrl = queueUrl
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id () {
    return this.job.MessageId
  }

  /**
   * Returns the SQS receipt handle.
   *
   * @returns {String}
   */
  receiptHandle () {
    return this.job.ReceiptHandle
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload () {
    const { data } = this.getParsedBody()

    return data
  }

  /**
   * Returns the raw JSON job payload.
   *
   * @returns {JSON}
   */
  getRawBody () {
    return this.job['Body']
  }

  /**
   * Returns the job payload parsed to JavaScript.
   *
   *
   * @returns {Object}
   */
  getParsedBody () {
    return JSON.parse(this.getRawBody())
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {String}
   */
  jobName () {
    const { displayName } = this.getParsedBody()

    return displayName
  }

  async fire () {
    await super.fire()
    await this.delete()
  }

  /**
   * Delete the job from the queue.
   */
  async delete () {
    super.delete()

    await this.client.deleteMessage({
      QueueUrl: this.queueUrl,
      ReceiptHandle: this.receiptHandle()
    }).promise()
  }
}

module.exports = SqsJob
