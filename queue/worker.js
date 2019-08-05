'use strict'

const QueueManager = require('.')

class Worker {
  constructor (config) {
    this.manager = QueueManager
    this.concurrency = config.concurrency || 20
    this.queues = [].concat(config.queues || 'default')
    this.shutdownTimeout = (config.timeout || 8) * 1000
  }

  async run () {
    // run worker continuously until SIGTERM
  }

  async stop () {
    // await this.manager.stop()
  }

  async getNextJob (...queues) {
    const connection = await this.manager.connection()

    return connection.pop(...queues)
  }
}

module.exports = Worker
