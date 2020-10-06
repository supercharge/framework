'use strict'

import { Job, Queue as QueueContract } from '@supercharge/contracts'

export class SyncQueue implements QueueContract {
  /**
   * Push a new job onto the queue.
   *
   * @param {String} jobName
   * @param {*} payload
   * @param {String} queue
   *
   * @returns {String} the job ID
   */
  async push (jobName: string, payload: any, queue?: string): Promise<string | number> {
    // const queueJob = new SyncJob(job, data)

    // try {
    //   await queueJob.fire()
    // } catch (error) {
    //   await queueJob.fail(error)
    //   throw error
    // }

    // return queueJob.id()
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String|Array} queue
   *
   * @returns {Job}
   */
  async pop (queue?: string): Promise<Job | undefined> {
    //
  }

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String|Array} queue
   *
   * @returns {Number}
   */
  async size (queue?: string): Promise<number> {
    //
  }

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String|Array} queue
   */
  async clear (queue?: string): Promise<void> {
    //
  }
}
