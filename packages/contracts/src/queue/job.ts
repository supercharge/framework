
export interface Job {
  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id (): string | number | undefined

  /**
   * Returns the queue job class name.
   */
  jobName(): string

  /**
   * Returns the queue job payload.
   */
  payload(): any

  /**
   * Returns the number of attempts for this job.
   */
  attempts (): number

  /**
   * Delete the job from the queue.
   */
  delete (): Promise<void>

  /**
   * Determine whether a job has been deleted.
   */
  isDeleted (): boolean

  /**
   * Determine whether a job has not been deleted.
   */
  isNotDeleted (): boolean

  /**
   * Determine whether a job has been released back onto the queue.
   */
  isReleased (): boolean

  /**
   * Determine whether a job has not been released back onto the queue.
   */
  isNotReleased (): boolean

  /**
   * Determine whether a job has been marked as failed.
   */
  hasFailed (): boolean

  /**
   * Determine whether a job has not been failed.
   */
  hasNotFailed (): boolean

  /**
   * Set a job as released back to the queue.
   */
  releaseBack (delay: number): Promise<void>

  /**
   * Mark this job as failed.
   */
  markAsFailed (): Promise<void>

  /**
   * Fire the job.
   */
  fire (): Promise<any>

  /**
   * This job ultimately failed. Delete it and call the
   * `failed` method if existing on the job instance.
   */
  fail (error: Error): Promise<void>
}
