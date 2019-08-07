'use strict'

const QueueManager = require('../')

class Job {
  constructor (job) {
    this._job = job
    this._instance = null
    this._manager = QueueManager
  }

  /**
   * Returns the raw job.
   *
   * @returns {Job}
   */
  get job () {
    return this._job
  }

  /**
   * Set a raw job.
   *
   * @param {Object} job
   */
  set job (job) {
    this._job = job
  }

  /**
   * Returns the job instance.
   *
   * @returns {Object}
   */
  get instance () {
    return this._instance
  }

  /**
   * Sets a job instance.
   *
   * @param {Object} instance
   */
  set instance (instance) {
    this._instance = instance
  }

  /**
   * Returns the queue manager instance.
   *
   * @returns {Object}
   */
  get manager () {
    return this._manager
  }

  /**
   * Sets a queue manager instance.
   *
   * @param {Object} manager
   */
  set manager (manager) {
    this._manager = manager
  }

  /**
   * Fire the job.
   */
  async fire () {
    const JobClass = this.manager.getJob(this.jobName())
    this.instance = new JobClass(this.payload())

    return this.instance.handle()
  }
}

module.exports = Job
