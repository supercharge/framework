'use strict'

const Job = require('./job')

class SyncJob extends Job {
  constructor (job, data) {
    super(job)

    this.data = data
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id () {
    return 'id'
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload () {
    return this.data
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {*}
   */
  jobName () {
    return this.job.name
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts () {
    return 1
  }
}

module.exports = SyncJob
