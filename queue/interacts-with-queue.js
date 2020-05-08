'use strict'

class InteractsWithQueue {
  /**
   * Create a new job instance with an empty base `job`.
   * This job will be filled by the queue manager
   */
  constructor () {
    this.job = null
  }

  /**
   * Set the base job instance (an instance of a dispatachable).
   *
   * @param {Dispatchable} job
   */
  setJob (job) {
    this.job = job

    return this
  }

  /**
   * Every queue job must implement a `handle` method
   * which will then override this one.
   */
  async handle () {
    throw new Error(`${this.contructor.name} must implement a handle() function.`)
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts () {
    if (this.job) {
      return this.job.attempts()
    }
  }

  /**
   * Returns the maximum number of attempts to process a job before marking it failed.
   *
   * @returns {Number}
   */
  maxAttempts () {
    // this method is a placeholder to be overwritten in a job class
  }

  /**
   * Releases a job back onto the queue.
   *
   * @param {Number} delay in seconds
   */
  async releaseBack (delay) {
    if (this.job) {
      return this.job.releaseBack(delay)
    }
  }

  /**
   * Releases a job back onto the queue. This is
   * an alias method for `releaseBack(delay)`.
   *
   * @param {Number} delay in seconds
   */
  async tryAgainIn (delay) {
    return this.releaseBack(delay)
  }

  /**
   * Delete the job from the queue.
   */
  async delete () {
    if (this.job) {
      return this.job.delete()
    }
  }

  /**
   * Fail this job from the queue. This will also call the
   * `failed` method if existing on the job instance.
   *
   * @param {Error} error
   */
  async fail (error) {
    if (this.job) {
      return this.job.fail(error)
    }
  }
}

module.exports = InteractsWithQueue
