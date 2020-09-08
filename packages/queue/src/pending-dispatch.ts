'use strict'

import { tap } from '@supercharge/goodies'
import { Dispatchable } from './dispatchable'
import { Queue as QueueManager } from './index'

export class PendingDispatch {
  /**
   * The queue name to dispatch the job on.
   */
  private queue?: string

  /**
   * The queue connection name to dispatch the job on.
   */
  private connection?: string

  /**
   * The queue manager instance.
   */
  private readonly queueManager: typeof QueueManager = QueueManager

  /**
   * The queue job to dispatch.
   */
  private readonly dispatchable: typeof Dispatchable

  /**
   * Create a new pending dispatch instance.
   *
   * @param {Dispatchable} dispatchable
   */
  constructor (dispatchable: typeof Dispatchable) {
    this.dispatchable = dispatchable
  }

  /**
   * Dispatch the job with the given `data`.
   *
   * @param {*} data
   */
  async dispatch (data: any): Promise<string | number> {
    return await this.queueManager.dispatch(this.dispatchable, data, this.connection, this.queue)
  }

  /**
   * Set the queue name for the job.
   */
  onQueue (name: string): this {
    return tap(this, () => {
      this.queue = name
    })
  }

  /**
   * Set the queue connection name for the job.
   */
  onConnection (connection: string): this {
    return tap(this, () => {
      this.connection = connection
    })
  }
}
