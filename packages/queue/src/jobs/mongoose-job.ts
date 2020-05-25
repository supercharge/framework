'use strict'

import { Job } from './job'

export class MongooseJob extends Job {
  constructor (job, client) {
    super(job)

    this.client = client
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id (): string {
    return this.job.id
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload (): any {
    return this.job.payload
  }

  /**
   * Returns the job’s queue.
   *
   * @returns {String}
   */
  queue (): string {
    return this.job.queue
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {*}
   */
  jobName (): string {
    return this.job.jobClassName
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts (): number {
    return this.job.attempts
  }

  /**
   * Fire the job.
   */
  async fire (): Promise<void> {
    await super.fire()
    await this.delete()
  }

  /**
   * Release the job back to the queue.
   *
   * @param {Number} delay in seconds
   */
  async releaseBack (delay: number = 0): Promise<void> {
    await super.releaseBack()

    await this.client.delete(this.id())

    await this.client.push({
      queue: this.queue(),
      payload: this.payload(),
      job: { name: this.jobName() },
      attempts: this.attempts() + 1,
      notBefore: this.dateWith(delay)
    })
  }

  /**
   * Calculates the date with added `delay`.
   *
   * @param {Number} delay in seconds
   *
   * @returns {Date}
   */
  dateWith (delay: number): Date {
    const date = new Date()
    date.setSeconds(date.getSeconds() + delay)

    return date
  }

  /**
   * Delete the job from the queue.
   */
  async delete (): Promise<void> {
    super.delete()
    await this.client.delete(this.id())
  }

  /**
   * If available, call the `failed` method on the job instance.
   *
   * @param {Error} error
   */
  async failed (error: Error): Promise<void> {
    await super.failed(error)
    await this.delete()
  }
}

module.exports = MongooseJob
