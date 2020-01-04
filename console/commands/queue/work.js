'use strict'

const Config = require('../../../config')
const Logger = require('../../../logging')
const Command = require('../../base-command')
const Worker = require('../../../queue/worker')
const WorkerOptions = require('../../../queue/worker-options')

class QueueWork extends Command {
  constructor () {
    super()

    this.worker = null
  }

  /**
   * Returns the command signature with
   * allowed arguments and flags.
   */
  static get signature () {
    return `
      queue:work
        { connection?: The name of the queue connection to fetch jobs from }
        { --queue=@value: The queues to process }
        { --attempts=@value: The maximum number of attempts to process a job before marking it failed (default: inifite attempts) }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Start the queue worker and process enqueued jobs'
  }

  /**
   * Handle the “queue:work” command.
   *
   * @param {Object} args
   * @param {Object} options
   */
  async handle (args, options) {
    await this.run(async () => {
      this.listenForShutdownSignals()
      this.createWorker(args, options)

      Logger.info(`Queue worker starting for connection "${this.worker.options.connectionName}" processing queue(s) "${this.worker.options.queues}"`)

      await this.worker.longPoll()
    })
  }

  /**
   * Create a queue worker for the given arguments and options.
   *
   * @param {Object} args
   * @param {Object} options
   *
   * @returns {Worker}
   */
  createWorker (args, options) {
    this.worker = new Worker(
      this.createWorkerOptionsFrom(args, options)
    )
  }

  /**
   * Create the queue worker options based on the
   * given arguments and flags passed to the
   * command while starting the worker.
   *
   * @param {Object} arguments
   * @param {Object} flags
   *
   * @returns {WorkerOptions}
   */
  createWorkerOptionsFrom ({ connection }, { queue, attempts }) {
    connection = this.getConnection(connection)

    return new WorkerOptions({
      connection,
      maxAttempts: attempts || 0,
      queues: this.getQueue(connection, queue)
    })
  }

  /**
   * Returns the queue connection name.
   *
   * @param {String} connection
   */
  getConnection (connection) {
    return connection || Config.get('queue.driver')
  }

  /**
   * Returns the queue names to process by this
   * worker. If not provided, uses the default
   * queue defined in the app config.
   *
   * @param {String} connection
   * @param {String} queue
   *
   * @returns {Array|String}
   */
  getQueue (connection, queue) {
    return queue
      ? queue.split(',').map(queue => queue.trim())
      : Config.get(`queue.connections.${connection}.queue`)
  }

  /**
   * Register event listener to properly shut
   * down the queue worker and connections
   * on `SIGINT` or `SIGTERM` events.
   */
  listenForShutdownSignals () {
    process
      .once('SIGINT', () => this.stop())
      .once('SIGTERM', () => this.stop())
  }

  /**
   * Stop the queue worker and connections
   * and exit the process.
   */
  async stop () {
    Logger.info('Stopping the queue worker')
    await this.worker.stop()

    Logger.info('Queue worker stopped')
    process.exit(0)
  }
}

module.exports = QueueWork
