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
      await this.process(job)
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
  async process (job) {
    try {
      await this.ensureJobNotAlreadyExceedsMaxAttempts(job)

      if (job.isDeleted()) {
        return
      }

      await job.fire()
    } catch (error) {
      await this.handleError(job, error)
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
   * @throws
   */
  async ensureJobNotAlreadyExceedsMaxAttempts (job) {
    if (this.maxAttempts(job) === 0) {
      return
    }

    if (job.attempts() < this.maxAttempts(job)) {
      return
    }

    return this.throwExceedsMaxAttemptsError(job)
  }

  /**
   * Returns the maximum number of times to attempt the given `job`.
   *
   * @param {Job} job
   *
   * @returns {Number}
   */
  maxAttempts (job) {
    return typeof job.maxAttempts() === 'number'
      ? job.maxAttempts()
      : this.options.maxAttempts
  }

  /**
   * Creates an error indicating that the
   * allowed number of attempts exceeded.
   *
   * @param {Object} job
   *
   * @returns {Error}
   */
  throwExceedsMaxAttemptsError (job) {
    throw new Error(`${job.jobName()} exceeded the allowed limit of ${this.options.maxAttempts} attempts.`)
  }

  /**
   * Handle job errors. For now, just log the error
   * and keep going. Eventually, we should have
   * a better handling here.
   *
   * @param {Object} job
   * @param {Error} error
   */
  async handleError (job, error) {
    Logger.error(error)

    await this.markAsFailedIfJobWillExceedMaxAttempts(job, error)
  }

  /**
   * Mark the job as failed if it will exceed the max attempts.
   * It wouldn’t be processed again next time so we can just
   * fail it here and delete it from the queue.
   *
   * @param {Object} job
   * @param {Error} error
   */
  async markAsFailedIfJobWillExceedMaxAttempts (job, error) {
    if (this.maxAttempts(job) === 0) {
      return
    }

    if (job.attempts() + 1 >= this.maxAttempts(job)) {
      await this.failJob(job, error)
    }
  }

  /**
   * Delete the job and mark as failed.
   *
   * @param {Object} job
   * @param {Error} error
   */
  async failJob (job, error) {
    return job.fail(error)
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
