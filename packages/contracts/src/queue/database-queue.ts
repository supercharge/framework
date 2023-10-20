
import { Job } from './job.js'

export interface DatabaseQueuePayload {
  /**
   * The job class name. This job name is used to identify a job class which
   * then be used to create a job instance once it’s due for processing will.
   */
  jobClassName: string

  /**
   * The job payload.
   */
  payload: any

  /**
   * The queue name on which the job will be dispatched.
   */
  queue: string

  /**
   * The number of attempts a job has already been handled.
   */
  attempts?: number

  /**
   * The date when the job becomes due for processing.
   */
  notBefore?: Date
}

export interface DatabaseQueue {
  /**
   * Push a new job onto the queue.
   */
  push (data: DatabaseQueuePayload): Promise<number | string>

  /**
   * Retrieve the next job from the queue.
   */
  pop (queue: string): Promise<Job | undefined>

  /**
   * Returns number of jobs on the given `queue`.
   */
  size (queue: string): Promise<number>

  /**
   * Clear all jobs from the given `queue`.
   */
  clear (queue: string): Promise<void>

  /**
   * Deletes the job with the given `id` from the queue.
   */
  delete (id: string | number): Promise<void>
}
