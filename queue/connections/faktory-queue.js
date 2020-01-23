'use strict'

const Faktory = require('faktory-worker')
const FaktoryJob = require('../jobs/faktory-job')
const Collect = require('@supercharge/collections')

class FaktoryQueue {
  constructor (config) {
    this.client = null
    this.config = config
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
   * Create a queue connection.
   *
   * @param {Object} config
   *
   * @returns {FaktoryQueue}
   */
  async connect () {
    this.client = await Faktory.connect(this.config)

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
   *
   * @returns {String} the job ID
   */
  async push (job, data, queue = this.defaultQueueName) {
    return this.client.push({
      queue,
      jobtype: job.name,
      args: [].concat(data),
      custom: { attempts: 0 }
    })
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue = this.defaultQueueName) {
    const job = await this.client.fetch(queue)

    return job
      ? new FaktoryJob(job, this.client, queue)
      : null
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queue
   *
   * @returns {Number}
   */
  async size (queue = this.defaultQueueName) {
    const info = await this.client.info()

    return Collect(Object.keys(info.queues))
      .filter(queueName => queue === queueName)
      .map(queueName => info.queues[queueName])
      .reduce((sum, jobCountInQueue) => {
        return sum + jobCountInQueue
      }, 0)
  }

  /**
   * Clears all jobs from all queues.
   */
  async clear () {
    return this.client.flush()
  }
}

module.exports = FaktoryQueue
