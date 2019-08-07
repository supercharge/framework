'use strict'

const QueueManager = require('.')
const Logger = require('../logging')
const Dispatcher = require('../event/dispatcher')

class Worker {
  constructor (workerOptions) {
    this.connection = null
    this.shouldStop = false
    this.jobInProgress = null
    this.manager = QueueManager
    this.dispatcher = Dispatcher
    this.workerOptions = workerOptions
  }

  /**
   * Poll the queue continuously for jobs
   * and process jobs when available.
   */
  async run () {
    this.connection = await this.manager.connection(this.workerOptions.connection)

    setImmediate(() => this.workHardBrewHard())
  }

  /**
   * This is the actual function long-polling the queue connection for new jobs.
   * When no job is available in the queue, it waits for a second. If a job
   * was available, it immediately tries to fetch the next job.
   */
  async workHardBrewHard () {
    if (!this.shouldRun()) {
      return this.pause(1000)
    }

    try {
      const job = await this.getNextJob()

      if (job) {
        this.jobInProgress = this.handle(job)
        this.pause(0)
      } else {
        this.pause(1000)
      }
    } catch (error) {
      Logger.error(error)
    }
  }

  /**
   * Determine whether to fetch the next job.
   */
  shouldRun () {
    return !this.shouldStop
  }

  /**
   * Retrieve the next job from the queue connection.
   *
   * @returns {Object}
   */
  async getNextJob () {
    return this.connection.pop(...this.workerOptions.queues)
  }

  /**
   * Start the job processing.
   *
   * @param {Object} job
   */
  async handle (job) {
    // TODO handle max attemps: mark job as failed if exceeding max attemps
    // TODO return early if job is arleady deleted

    await job.fire()

    // try {
    //   await job.fire()
    // } catch (error) {
    //   // TODO handle job failure
    //   throw error
    // } finally {
    //   // TODO release job back to the queue if not exceeding max attemps
    //   // TODO release job back with delay?
    // }
  }

  /**
   * Restart polling the queue connection
   * for a new job after the given time.
   *
   * @param {Number} ms
   */
  pause (ms) {
    setTimeout(() => this.workHardBrewHard(), ms)
  }

  /**
   * Stop the queue worker by finishing the job in
   * progress and closing the queue connection.
   */
  async stop () {
    this.shouldStop = true

    /**
     * This timeout is used to ensure that the worker forcefully
     * stops after the `shutdownTimeout`. If all other
     * processing finishes earlier, everything is fine.
     */
    const timeout = setTimeout(async () => {
      await this.manager.stop()
    }, this.workerOptions.shutdownTimeout)

    await this.jobInProgress
    await this.manager.stop()
    clearTimeout(timeout)
  }
}

module.exports = Worker
