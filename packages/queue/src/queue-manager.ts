'use strict'

import { Dispatchable } from './dispatchable'
import { Manager } from '@supercharge/manager'
import { DatabaseQueue } from './database-queue'
import { Queue as QueueContract, Job } from '@supercharge/contracts'

export class QueueManager extends Manager {
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
  async dispatch (job: typeof Dispatchable, payload: any, connectionName?: string, queue?: string): Promise<string | number> {
    return this.driver(connectionName).push(
      job.name, payload, queue
    )
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
