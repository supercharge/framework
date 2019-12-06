'use strict'

const QueueManager = require('.')
const Logger = require('../logging')

class Worker {
  constructor (workerOptions) {
    this._shouldStop = false
    this.manager = QueueManager
    this.workerOptions = workerOptions
  }

  /**
   * Returns the worker options.
   *
   * @returns {WorkerOptions}
   */
  get options () {
    return this.workerOptions
  }

  /**
   * Determine whether to fetch the next job. Returns `true`
   * if the worker should stop, `false` otherwise.
   *
   * @returns {Boolean}
   */
  get shouldStop () {
    return this._shouldStop
  }

  /**
   * Set the `shouldStop` value.
   *
   * @param {Boolean} shouldStop
   */
  set shouldStop (shouldStop) {
    this._shouldStop = shouldStop
  }

  /**
   * Poll the queue continuously for jobs
   * and process jobs when available.
   */
  async longPoll () {
    setImmediate(() => this.workHardPollHard())
  }

  /**
   * This is the actual function long-polling the queue connection for new jobs.
   * When no job is available in the queue, it waits for a second. If a job
   * was available, it immediately tries to fetch the next job.
   */
  async workHardPollHard () {
    if (this.shouldStop) {
      return this.sleepSeconds(1)
    }

    const job = await this.getNextJob()

    if (job) {
      await this.handle(job)
      this.sleepSeconds(0)
    } else {
      this.sleepSeconds(1)
    }
  }

  /**
   * Restart polling the queue connection for a new job
   * after the given amount of seconds `s`.
   *
   * @param {Number} seconds
   */
  sleepSeconds (seconds) {
    this.sleep(seconds * 1000)
  }

  /**
   * Restart polling the queue connection
   * for a new job after the given time.
   *
   * @param {Number} ms
   */
  sleep (ms) {
    setTimeout(() => this.workHardPollHard(), ms)
  }

  /**
   * Retrieve the next job from the queue connection.
   *
   * @returns {Object}
   */
  async getNextJob () {
    const connection = await this.manager.connection(this.options.connectionName)

    return connection.pop(...this.options.queues)
  }

  /**
   * Start the job processing, handle errors
   * and decide whether to release the
   * job back onto the queue.
   *
   * @param {Object} job
   */
  async handle (job) {
    try {
      if (this.jobExceedsMaxAttempts(job)) {
        return this.failJob(job, this.exceedsMaxAttemptsError(job))
      }

      if (job.isDeleted()) {
        return
      }

      await job.fire()
    } catch (error) {
      await this.handleJobError(error)
    } finally {
      if (job.isNotDeleted() && job.isNotReleased() && job.hasNotFailed()) {
        await job.releaseBack()
      }
    }
  }

  /**
   * Determines whether the job exceeds
   * the number of allowed attempts.
   *
   * @param {Object} job
   *
   * @returns {Boolean}
   */
  jobExceedsMaxAttempts (job) {
    if (this.options.maxAttempts === 0) {
      return false
    }

    if (job.attempts() && job.attempts() <= this.options.maxAttempts) {
      return false
    }

    return true
  }

  /**
   * Creates an error indicating that the
   * allowed number of attempts exceeded.
   *
   * @param {Object} job
   *
   * @returns {Error}
   */
  exceedsMaxAttemptsError (job) {
    return new Error(`${job.jobName()} exceeted the allowed limit of attempts.`)
  }

  /**
   * Delete the job and mark as failed.
   *
   * @param {Object} job
   * @param {Error} error
   */
  async failJob (job, error) {
    await this.handleJobError(error)

    return job.fail(error)
  }

  /**
   * Handle job errors. For now, just log the error
   * and keep going. Eventually, we should have a better handling here.
   *
   * @param {Error} error
   */
  async handleJobError (error) {
    Logger.error(error)
  }

  /**
   * Stop the queue worker by finishing the job in
   * progress and closing the queue connection.
   */
  async stop () {
    this.shouldStop = true
    await this.manager.stop()
  }
}

module.exports = Worker
