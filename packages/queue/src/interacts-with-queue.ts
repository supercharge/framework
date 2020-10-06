'use strict'

import { tap } from '@supercharge/goodies'
import { Job as JobContract } from '@supercharge/contracts'

export class InteractsWithQueue {
  /**
   * The application’s queue job instance.
   */
  private job: JobContract | null

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
  setJob (job: JobContract): this {
    return tap(this, () => {
      this.job = job
    })
  }

  /**
   * Every queue job must implement a `handle` method
   * which will then override this one.
   *
   * @throws
   */
  async handle (): Promise<void> {
    throw new Error(`${this.constructor.name} must implement a handle() function.`)
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts (): number {
    if (this.job) {
      return this.job.attempts()
    }
  }

  /**
   * Releases a job back onto the queue.
   *
   * @param {Number} delay in seconds
   */
  async releaseBack (delay: number): Promise<void> {
    if (this.job) {
      return await this.job.releaseBack(delay)
    }
  }

  /**
   * Releases a job back onto the queue. This is
   * an alias method for `releaseBack(delay)`.
   *
   * @param {Number} delay in seconds
   */
  async tryAgainIn (delay: number): Promise<void> {
    return await this.releaseBack(delay)
  }

  /**
   * Delete the job from the queue.
   */
  async delete (): Promise<void> {
    if (this.job) {
      return await this.job.delete()
    }
  }

  /**
   * Fail this job from the queue. This will also call the
   * `failed` method if existing on the job instance.
   *
   * @param {Error} error
   * @param {Job} job
   */
  async fail (error: Error): Promise<void> {
    if (this.job) {
      return await this.job.fail(error)
    }
  }
}
