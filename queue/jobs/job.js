'use strict'

const QueueManager = require('../')

class Job {
  constructor (job) {
    this._job = job
    this._failed = false
    this._deleted = false
    this._released = false
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
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts () {
    const { attempts } = this.payload()

    return attempts
  }

  /**
   * Flags the job as deleted. The actual procedure to delete
   * the job from the queue must be part of the `delete`
   * method implemented by the individual job class.
   */
  delete () {
    this._deleted = true
  }

  /**
   * Determine whether a job has been deleted.
   *
   * @returns {Boolean}
   */
  isDeleted () {
    return this._deleted
  }

  /**
   * Determine whether a job has not been deleted.
   *
   * @returns {Boolean}
   */
  isNotDeleted () {
    return !this.isDeleted()
  }

  /**
   * Set a job as released back to the queue.
   */
  releaseBack () {
    this._released = true
  }

  /**
   * Determine whether a job has been
   * released back onto the queue.
   *
   * @returns {Boolean}
   */
  isReleased () {
    return this._released
  }

  /**
   * Determine whether a job has not been
   * released back onto the queue.
   *
   * @returns {Boolean}
   */
  isNotReleased () {
    return !this.isReleased()
  }

  /**
   * Mark this job as failed.
   */
  markAsFailed () {
    this._failed = true
  }

  /**
   * Determine whether a job has been marked as failed.
   *
   * @returns {Boolean}
   */
  hasFailed () {
    return this._failed
  }

  /**
   * Determine whether a job has not been failed.
   *
   * @returns {Boolean}
   */
  hasNotFailed () {
    return !this.hasFailed()
  }

  /**
   * Fire the job.
   */
  async fire () {
    this.instance = this.resolveInstance()

    return this.instance.handle()
  }

  /**
   * Resolve a job instance.
   *
   * @returns {Object}
   */
  resolveInstance () {
    const JobClass = this.manager.getJob(this.jobName())

    return new JobClass(this.payload()).setJob(this)
  }

  /**
   * This job ultimately failed. Delete it and call the
   * `failed` method if existing on the job instance.
   *
   * @param {Error} error
   */
  async fail (error) {
    this.markAsFailed()

    try {
      await this.delete()
      await this.failed(error)
    } catch (ignoreError) { }
  }

  /**
   * If available, call the `failed` method on the job instance.
   *
   * @param {Error} error
   */
  async failed (error) {
    this.instance = this.resolveInstance()

    if (typeof this.instance.failed === 'function') {
      error.job = this
      await this.instance.failed(error)
    }
  }
}

module.exports = Job
