'use strict'

import { PendingDispatch } from './pending-dispatch'
import { InteractsWithQueue } from './interacts-with-queue'

export class Dispatchable extends InteractsWithQueue {
  /**
   * Set the queue name for the job.
   */
  static onQueue (queue: string): PendingDispatch {
    return new PendingDispatch(this).onQueue(queue)
  }

  /**
   * Set the queue connection name for the job.
   *
   * @param {String} queue
   *
   * @returns {PendingDispatch}
   */
  static onConnection (connection: string): PendingDispatch {
    return new PendingDispatch(this).onConnection(connection)
  }

  /**
   * Dispatch the job with the given `data`.
   */
  static async dispatch (data: any): Promise<void> {
    return new PendingDispatch(this).dispatch(data)
  }
}
