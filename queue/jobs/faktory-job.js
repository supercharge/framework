'use strict'

const Job = require('./job')

class FaktoryJob extends Job {
  constructor (job, client) {
    super(job)

    this.client = client
  }

  id () {
    return this.job.jid
  }

  payload () {
    return this.job.args[0]
  }

  jobName () {
    return this.job.jobtype
  }

  getFaktoryJob () {
    return this.job
  }

  async fire () {
    await super.fire()
    await this.client.ack(this.id())
  }
}

module.exports = FaktoryJob
