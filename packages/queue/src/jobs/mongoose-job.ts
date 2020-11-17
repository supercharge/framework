'use strict'

import { Job } from './job'
import { tap } from '@supercharge/goodies'
import { Job as JobContract } from '@supercharge/contracts'
import { DatabaseQueueMongooseClient } from '../database-queue-mongoose-client'

export class MongooseJob extends Job {
  private readonly client: typeof DatabaseQueueMongooseClient

  constructor (job: JobContract, client: typeof DatabaseQueueMongooseClient) {
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
   * Returns the job’s class name identifying the job that handles the payload.
   *
   * @returns {String}
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
    return this.job.attempts || 0
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
    await super.releaseBack(delay)

    await this.client.delete(this.id())

    await this.client.push({
      queue: this.queue(),
      payload: this.payload(),
      jobClassName: this.jobName(),
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
    return tap(new Date(), date => {
      date.setSeconds(date.getSeconds() + delay)
    })
  }

  /**
   * Delete the job from the queue.
   */
  async delete (): Promise<void> {
    await super.delete()
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
