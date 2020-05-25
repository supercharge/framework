'use strict'

import { Manager } from '@supercharge/manager'
import { DatabaseQueue } from './database-queue'
import { Queue as QueueContract, Job } from '@supercharge/contracts'

export class QueueManager extends Manager implements QueueContract {
  /**
   * An in-memory key-value store for available queue jobs.
   */
  private readonly jobs: Map<string, string>

  constructor () {
    super()

    this.jobs = new Map()
  }

  /**
  * Push a new job onto the queue.
  *
  * @param {String} jobName
  * @param {*} payload
  * @param {String} queue
  *
  * @returns {String} the job ID
  */
  async push (jobName: string, payload: any, queue: string|string[]): Promise<string> {
    return this.driver().push(jobName, payload, queue)
  }

  /**
  * Retrieve the next job from the queue.
  *
  * @param  {String|Array} queue
  *
  * @returns {Job}
  */
  async pop (queue: string|string[]): Promise<Job> {
    return this.driver().pop(queue)
  }

  /**
  * Returns number of jobs on the given `queue`.
  *
  * @param  {String|Array} queue
  *
  * @returns {Number}
  */
  async size (queue: string|string[]): Promise<number> {
    return this.driver().size(queue)
  }

  /**
  * Clear all jobs from the given `queue`.
  *
  * @param {String|Array} queue
  */
  async clear (queue: string|string[]): Promise<void> {
    return this.driver().clear(queue)
  }

  /**
   * Returns the queue driver instance.
   *
   * @param name
   *
   * @returns {QueueContract}
   *
   * @throws
   */
  protected driver (name = this.defaultDriver()): QueueContract {
    return super.driver(name)
  }

  /**
   * Returns the default queue driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.config().get('queue.driver', 'database')
  }

  /**
   * Create a database queue driver.
   *
   * @returns {QueueContract}
   */
  protected createDatabaseDriver (): DatabaseQueue {
    return new DatabaseQueue(this.app)
  }
}
