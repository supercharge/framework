'use strict'

class FaktoryQueue {
  constructor (client) {
    this.client = client
  }

  async push (jobName, data, queue) {
    const job = this.client.job(jobName, data)

    if (queue) {
      job.queue = queue
    }

    return this.client.push(job)
  }

  async pop (...queues) {
    return this.client.fetch(...queues)
  }

  async size () {
    console.log(
      await this.client.info()
    )
  }
}

module.exports = FaktoryQueue
