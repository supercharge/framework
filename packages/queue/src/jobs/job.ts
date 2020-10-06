'use strict'

import { Job as JobContract } from '@supercharge/contracts'
import { Dispatchable } from '../dispatchable'

export abstract class Job<T = any> implements JobContract {
  protected job: T
  private _failed: boolean
  private _released: boolean
  private _deleted: boolean
  private _instance: Dispatchable | null
  private readonly _manager: any

  constructor (job: T) {
    this.job = job
    this._failed = false
    this._deleted = false
    this._released = false
    this._instance = null
  }

  /**
   * Returns the job instance.
   *
   * @returns {Dispatchable}
   */
  get instance (): Dispatchable {
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
   * Returns the job ID.
   *
   * @returns {String}
   */
  abstract id (): string | number | undefined

  /**
   * Returns the queue job class name.
   *
   * @returns {String}
   */
  abstract jobName (): string

  /**
   * Returns the queue job payload.
   *
   * @returns {Object}
   */
  abstract payload (): any

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  abstract attempts (): number

  /**
   * Returns the maximum number of attempts to process a job before marking it failed.
   *
   * @returns {Number|undefined}
   */
  maxAttempts (): number | undefined {
    return this.resolveInstance().maxAttempts()
  }

  /**
   * Flags the job as deleted. The actual procedure to delete
   * the job from the queue must be part of the `delete`
   * method implemented by the individual job class.
   */
  async delete (): Promise<void> {
    this._deleted = true
  }

  /**
   * Determine whether a job has been deleted.
   *
   * @returns {Boolean}
   */
  isDeleted (): boolean {
    return this._deleted
  }

  /**
   * Determine whether a job has not been deleted.
   *
   * @returns {Boolean}
   */
  isNotDeleted (): boolean {
    return !this.isDeleted()
  }

  /**
   * Set a job as released back to the queue.
   */
  async releaseBack (_delay: number): Promise<void> {
    this._released = true
  }

  /**
   * Determine whether a job has been
   * released back onto the queue.
   *
   * @returns {Boolean}
   */
  isReleased (): boolean {
    return this._released
  }

  /**
   * Determine whether a job has not been
   * released back onto the queue.
   *
   * @returns {Boolean}
   */
  isNotReleased (): boolean {
    return !this.isReleased()
  }

  /**
   * Mark this job as failed.
   */
  async markAsFailed (): Promise<void> {
    this._failed = true
  }

  /**
   * Determine whether a job has been marked as failed.
   *
   * @returns {Boolean}
   */
  hasFailed (): boolean {
    return this._failed
  }

  /**
   * Determine whether a job has not been failed.
   *
   * @returns {Boolean}
   */
  hasNotFailed (): boolean {
    return !this.hasFailed()
  }

  /**
   * Fire the job.
   */
  async fire (): Promise<void> {
    return await this.resolveInstance().handle()
  }

  /**
   * Resolve a job instance.
   *
   * @returns {Object}
   */
  resolveInstance (): Dispatchable {
    if (!this.instance) {
      const JobClass = this.manager.getJob(this.jobName())

      this.instance = new JobClass(this.payload()).setJob(this)
    }

    return this.instance
  }

  /**
   * This job ultimately failed. Delete it and call the
   * `failed` method if existing on the job instance.
   *
   * @param {Error} error
   */
  async fail (error: Error): Promise<void> {
    await this.markAsFailed()

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
  async failed (error: Error): Promise<void> {
    this.instance = this.resolveInstance()

    if (typeof this.instance.failed === 'function') {
      await this.instance.failed(error)
    }
  }
}
