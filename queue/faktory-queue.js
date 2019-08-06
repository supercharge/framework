'use strict'

const Faktory = require('faktory-worker')
const FaktoryJob = require('./jobs/faktory-job')
const Collect = require('@supercharge/collections')

class FaktoryQueue {
  constructor () {
    this.client = null
  }

  async connect (config) {
    this.client = await Faktory.connect(config)

    return this
  }

  async disconnect () {
    await this.client.close()
  }

  async push (jobName, data, queue) {
    const job = this.client.job(jobName, data)

    if (queue) {
      job.queue = queue
    }

    return this.client.push(job)
  }

  async pop (...queues) {
    const job = await this.client.fetch(...queues)

    if (job) {
      return new FaktoryJob(job, this.client)
    }
  }

  async size (...queues) {
    const info = await this.client.info()

    return Collect(Object.keys(info.queues))
      .filter(queueName => queues.includes(queueName))
      .map(queueName => info.queues[queueName])
      .reduce((sum, amount) => sum + amount)
  }
}

module.exports = FaktoryQueue
