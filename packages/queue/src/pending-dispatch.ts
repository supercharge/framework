'use strict'

import { Dispatchable } from './dispatchable'
import {} from '@super'

export class PendingDispatch {
  /**
   * The queue name to dispatch the job on.
   */
  private queue: string = 'null'

  /**
   * The queue connection name to dispatch the job on.
   */
  private connection: string= 'null'

  /**
   * The queue manager instance.
   */
  private readonly queueManager: any

  /**
   * The queue job to dispatch.
   */
  private readonly dispatchable: typeof Dispatchable

  constructor (dispatchable: typeof Dispatchable) {
    this.dispatchable = dispatchable
  }

  /**
   * Dispatch the job with the given `data`.
   */
  async dispatch (data: any): Promise<void> {
    return this.queueManager.dispatch(this.dispatchable, {
      data,
      queue: this.queue,
      connection: this.connection
    })
  }

  /**
   * Set the queue name for the job.
   */
  onQueue (name: string): this {
    this.queue = name

    return this
  }

  /**
   * Set the queue connection name for the job.
   */
  onConnection (connection: string): this {
    this.connection = connection

    return this
  }
}
