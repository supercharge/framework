'use strict'

import { Manager } from '@supercharge/manager'
import { MongooseQueueClientFactory as MongooseClientFactory } from './database-queue-mongoose-client'
import {
  Job,
  // Config as QueueConfig,
  Queue as QueueContract,
  DatabaseQueue as DatabaseQueueContract
} from '@supercharge/contracts'

export class DatabaseQueue extends Manager implements QueueContract {
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
    return this.driver().push({
      jobClassName: jobName,
      payload,
      queue: this.getQueue(queue)
    })
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String|Array} queue
   *
   * @returns {Job}
   */
  async pop (queue?: string): Promise<Job | undefined> {
    return this.driver().pop(
      this.getQueue(queue)
    )
  }

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String|Array} queue
   *
   * @returns {Number}
   */
  async size (queue?: string): Promise<number> {
    return this.driver().size(
      this.getQueue(queue)
    )
  }

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String|Array} queue
   */
  async clear (queue?: string): Promise<void> {
    return this.driver().clear(
      this.getQueue(queue)
    )
  }

  /**
   * Returns the configuration for the given `queue`.
   *
   * @param queue
   */
  protected getQueue (queue?: string): string {
    return queue ?? this
      .config()
      .get(`queue.connections.${queue}`, {})
      .queue
  }

  /**
   * Returns the database queue driver instance.
   *
   * @param name
   *
   * @returns {QueueContract}
   *
   * @throws
   */
  protected driver (name: string = this.defaultDriver()): DatabaseQueueContract {
    return super.driver(name)
  }

  /**
   * Returns the default queue driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.config().get('database.default')
  }

  /**
   * Create a Mongoose database queue driver.
   *
   * @returns {DatabaseQueue}
   */
  protected createMongooseDriver (): DatabaseQueueContract {
    return MongooseClientFactory(
      this.config().get('queue.connections.mongoose', {})
    )
  }
}
