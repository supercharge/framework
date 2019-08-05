'use strict'

const Faktory = require('faktory-worker')

class FaktoryQueue {
  constructor () {
    this.client = null
  }

  async start () {
    this.client = await Faktory.connect()
  }

  async stop () {
    await this.client.close()
  }

  async push (job, data) {
    return this.client.job(job, data).push()
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
