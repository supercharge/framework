'use strict'

const Job = require('./job')
const Moment = require('moment')

class FaktoryJob extends Job {
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
    return this.job.jid
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload () {
    return this.job.custom
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
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts () {
    const { attempts } = this.payload()

    return attempts
  }

  /**
   * Fire the job.
   */
  async fire () {
    await super.fire()
    await this.client.ack(this.id())
  }

  /**
   * Release the job back to the queue.
   *
   * @param {Number} delay in minutes
   */
  async releaseBack (delay = 0) {
    await super.releaseBack(delay)
    await this.client.ack(this.id())

    const { attempts, ...payload } = this.payload()

    return this.client.push({
      queue: this.queue,
      jobtype: this.jobName(),
      at: Moment().add(delay, 'minutes'),
      custom: Object.assign({ attempts: attempts + 1 }, payload)
    })
  }

  /**
   * Delete the job from the queue.
   */
  async delete () {
    super.delete()

    await this.client.ack(this.id())
  }

  /**
   * If available, call the `failed` method on the job instance.
   *
   * @param {Error} error
   */
  async failed (error) {
    await this.client.fail(this.id(), error)
    await super.failed(error)
  }
}

module.exports = FaktoryJob
