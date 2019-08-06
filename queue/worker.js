'use strict'

const QueueManager = require('.')
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

  async run () {
    this.connection = await this.manager.connection(this.workerOptions.connection)

    return this.workHardBrewHard()
  }

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
      console.log(error)
    }
  }

  shouldRun () {
    return !this.shouldStop
  }

  async getNextJob () {
    return this.connection.pop(...this.workerOptions.queues)
  }

  async handle (job) {
    await job.fire()
  }

  pause (ms) {
    setTimeout(() => this.workHardBrewHard(), ms)
  }

  async stop () {
    this.shouldStop = true

    const timeout = setTimeout(async () => {
      await this.manager.stop()
    }, this.workerOptions.shutdownTimeout)

    await this.jobInProgress
    await this.manager.stop()
    clearTimeout(timeout)
  }
}

module.exports = Worker
