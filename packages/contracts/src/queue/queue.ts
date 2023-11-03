
import { Job } from './job.js'

export interface Queue {
  /**
   * Push a new job onto the queue.
   */
  push (jobName: string, payload: any, queue?: string): Promise<string | number>

  /**
   * Retrieve the next job from the queue.
   */
  pop (queue?: string): Promise<Job | undefined>

  /**
   * Returns number of jobs on the given `queue`.
   */
  size (queue?: string): Promise<number>

  /**
   * Clear all jobs from the given `queue`.
   */
  clear (queue?: string): Promise<void>
}
