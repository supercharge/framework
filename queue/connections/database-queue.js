'use strict'

const Config = require('../../config')
const Database = require('../../database')
const ClientFactory = require('./database-queue-client-faktory')

class DatabaseQueue {
  constructor (config) {
    this.config = config
  }

  /**
   * Returns the default queue name.
   *
   * @returns {String}
   */
  get defaultQueueName () {
    return this.config.queue
  }

  /**
   * Create a queue connection.
   *
   * @param {Object} config
   *
   * @returns {DatabaseQueue}
   */
  async connect () {
    await Database.connect()

    return this
  }

  /**
   * Close an existing queue connection.
   */
  async disconnect () {
    /**
     * We’re not closing the database connection here
     * because the main application may still need it.
     */
  }

  /**
   * Push a new job with `data` to process
   * onto the given `queue`.
   *
   * @param {String} jobName
   * @param {*} payload
   * @param {String} queue
   *
   * @returns {String} the job ID
   */
  async push (job, payload, queue = this.defaultQueueName) {
    return this.client().push({ job, payload, queue })
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue = this.defaultQueueName) {
    return this.client().pop(queue)
  }

  /**
   * Returns the size of the queue.
   *
   * @param  {String} queue
   *
   * @returns {Number}
   */
  async size (queue = this.defaultQueueName) {
    return this.client().size(queue)
  }

  /**
   * Create the database client for the configured
   * default database driver.
   *
   * @returns {DatabaseQueueClient}
   */
  client () {
    return ClientFactory.make({
      driver: this.defaultDatabaseDriver(),
      config: this.config
    })
  }

  /**
   * Returns the default database driver.
   *
   * @returns {String}
   */
  defaultDatabaseDriver () {
    return Config.get('database.default')
  }
}

module.exports = DatabaseQueue
