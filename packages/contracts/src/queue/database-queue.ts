'use strict'

import { Job } from './job'

export interface DatabaseQueuePayload {
  job: Job

  payload: any

  queue: string

  attempts: number

  notBefore: Date
}

export interface DatabaseQueue {
  /**
   * Push a new job onto the queue.
   *
   * @param {String} jobName
   * @param {*} payload
   * @param {String} queue
   *
   * @returns {String} the job ID
   */
  push (data: DatabaseQueuePayload): Promise<number>

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String|Array} queue
   *
   * @returns {Job}
   */
  pop (queue: string): Promise<Job | null>

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String|Array} queue
   *
   * @returns {Number}
   */
  size (queue: string): Promise<number>

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String|Array} queue
   */
  clear (queue: string): Promise<void>
}
