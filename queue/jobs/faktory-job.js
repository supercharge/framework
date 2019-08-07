'use strict'

const Job = require('./job')

class FaktoryJob extends Job {
  constructor (job, client) {
    super(job)

    this.client = client
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id () {
    return this.job.jid
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload () {
    return this.job.args[0]
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {*}
   */
  jobName () {
    return this.job.jobtype
  }

  /**
   * Fire the job.
   */
  async fire () {
    await super.fire()
    await this.client.ack(this.id())
  }
}

module.exports = FaktoryJob
