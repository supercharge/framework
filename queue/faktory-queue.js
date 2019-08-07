'use strict'

const Faktory = require('faktory-worker')
const FaktoryJob = require('./jobs/faktory-job')
const Collect = require('@supercharge/collections')

class FaktoryQueue {
  constructor () {
    this.client = null
  }

  /**
   * Create a queue connection.
   *
   * @param {Object} config
   *
   * @returns {FaktoryQueue}
   */
  async connect (config) {
    this.client = await Faktory.connect(config)

    return this
  }

  /**
   * Close an existing queue connection.
   */
  async disconnect () {
    await this.client.close()
  }

  /**
   * Push a new job with `data` to process
   * onto the given `queue`.
   *
   * @param {String} jobName
   * @param {*} data
   * @param {String} queue
   */
  async push (jobName, data, queue) {
    return this.client.push({
      queue,
      args: data,
      jobtype: jobName
    })
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue) {
    const job = await this.client.fetch(queue)

    if (job) {
      return new FaktoryJob(job, this.client)
    }
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queue
   *
   * @returns {Number}
   */
  async size (queue) {
    const info = await this.client.info()

    return Collect(Object.keys(info.queues))
      .filter(queueName => queue === queueName)
      .map(queueName => info.queues[queueName])
      .reduce((sum, jobCountInQueue) => sum + jobCountInQueue, 0)
  }
}

module.exports = FaktoryQueue
