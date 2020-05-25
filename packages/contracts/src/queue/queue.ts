'use strict'

import { Job } from './job'

export interface Queue {
  /**
   * Push a new job onto the queue.
   *
   * @param {String} jobName
   * @param {*} payload
   * @param {String} queue
   *
   * @returns {String} the job ID
   */
  push (jobName: string, payload: any, queue: string|string[]): Promise<string>

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String|Array} queue
   *
   * @returns {Job}
   */
  pop (queue: string|string[]): Promise<Job>

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String|Array} queue
   *
   * @returns {Number}
   */
  size (queue: string|string[]): Promise<number>

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String|Array} queue
   */
  clear (queue: string|string[]): Promise<void>
}
