'use strict'

const Config = require('../../../config')
const Logger = require('../../../logging')
const BaseCommand = require('../base-command')
const Worker = require('../../../queue/worker')
const WorkerOptions = require('../../../queue/worker-options')
const QueueBootstrapper = require('../../../queue/bootstrapper')

class QueueWork extends BaseCommand {
  constructor () {
    super()

    this.worker = null
  }

  static get signature () {
    return `
      queue:work
        { connection?: The name of the queue connection to fetch jobs from }
        { --queue=@value: The queues to process }
        { --shutdown-timeout=@value: The timeout in seconds to wait before forcefully stopping the queue connection }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Start the queue worker and process enqueued jobs'
  }

  async handle (args, options) {
    await this.run(async () => {
      await new QueueBootstrapper().boot() // TODO
      this.listenForShutdownSignals()

      const config = this.createWorkerOptionsFrom(args, options)
      this.worker = new Worker(config)

      Logger.info(`Queue worker starting for connection "${config.connection()}" processing queue(s) "${config.queues()}"`)
      await this.worker.run()
    })
  }

  createWorkerOptionsFrom ({ connection }, { queue, shutdownTimeout }) {
    connection = this.getConnection(connection)

    return new WorkerOptions({
      connection,
      shutdownTimeout,
      queues: this.getQueue(connection, queue)
    })
  }

  getConnection (connection) {
    return connection || Config.get('queue.driver')
  }

  getQueue (connection, queue) {
    return queue
      ? queue.split(',')
      : Config.get(`queue.connections.${connection}.default`)
  }

  listenForShutdownSignals () {
    process
      .once('SIGINT', () => this.stop())
      .once('SIGTERM', () => this.stop())
  }

  async stop () {
    Logger.info('Stopping the queue worker')
    await this.worker.stop()

    Logger.info('Queue worker stopped')
    process.exit(0)
  }
}

module.exports = QueueWork
