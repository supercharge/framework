'use strict'

const Job = require('./job')

class MongooseJob extends Job {
  constructor (job, client, queue) {
    super(job)

    this.queue = queue
    this.client = client
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id () {
    return this.job.id
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload () {
    return this.job.payload
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {*}
   */
  jobName () {
    return this.job.jobClassName
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts () {
    return this.job.attempts
  }

  /**
   * Fire the job.
   */
  async fire () {
    await super.fire()
    await this.delete()
  }

  /**
   * Release the job back to the queue.
   *
   * @param {Number} delay in minutes
   */
  async releaseBack (delay = 0) {
    await super.releaseBack(delay)

    await this.client.delete(this.id())
    await this.client.push({
      queue: this.queue,
      payload: this.payload(),
      job: { name: this.jobName() },
      attempts: this.attempts() + 1
    })
  }

  /**
   * Delete the job from the queue.
   */
  async delete () {
    super.delete()
    try {
      await this.client.delete(this.id())
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * If available, call the `failed` method on the job instance.
   *
   * @param {Error} error
   */
  async failed (error) {
    await super.failed(error)
    await this.delete()
  }
}

module.exports = MongooseJob
