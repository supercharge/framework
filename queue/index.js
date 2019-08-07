'use strict'

const Config = require('../config')
const Collect = require('@supercharge/collections')

class QueueManager {
  constructor () {
    this.jobs = new Map()
    this.connectors = new Map()
    this.connections = new Map()
  }

  /**
   * Returns the queue config.
   *
   * @returns {Object}
   */
  config () {
    return Config.get('queue')
  }

  /**
   * Determines whether the default session driver
   * has a truthy value.
   *
   * @returns {Boolean}
   */
  _queueConfigured () {
    return !!this._defaultDriver()
  }

  /**
   * Returns the name of the default queue driver.
   *
   * @returns {String}
   */
  _defaultDriver () {
    return Config.get('queue.driver')
  }

  /**
   * Register a queue connector which can then be used to
   * dispatch queue jobs onto the related connection.
   *
   * @param {String} name
   * @param {Class} connector
   */
  addConnector (name, connector) {
    this.connectors.set(name, connector)
  }

  /**
   * Retrieves a queue connection. If there’s no existing
   * connection identified by `name`, it creates a new
   * connection and returns it afterwards.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  async connection (name = this._defaultDriver()) {
    if (!this.hasConnection(name)) {
      this.connections.set(name, await this.resolveConnection(name))
    }

    return this.connections.get(name)
  }

  /**
   * Determines whether there’s an active queue
   * connection identified by the given `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  hasConnection (name) {
    return this.connections.has(name)
  }

  /**
   * Creates a new connection instance and connects to the
   * individual service, like the AWS SQS service,
   * a Faktory instance  or Redis database.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  async resolveConnection (name) {
    return this.getConnector(name).connect()
  }

  /**
   * Resolves the requested connector or
   * throws when unavailable.
   *
   * @param {String} name
   *
   * @returns {Object}
   *
   * @throws
   */
  getConnector (name) {
    if (!this.hasConnector(name)) {
      throw new Error(`Missing queue connector for driver "${name}"`)
    }

    return this.resolveConnector(name)
  }

  /**
   * Creates a new queue connection instance.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  resolveConnector (name) {
    const Connector = this.connectors.get(name)

    return new Connector(
      this.getConfig(name)
    )
  }

  /**
   * Returns the queue   connection configuration.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  getConfig (name) {
    return Config.get(`queue.connections.${name}`)
  }

  /**
   * Determines whether the queue connector
   * identified by `name` is available.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  hasConnector (name) {
    return this.connectors.has(name)
  }

  /**
   * Caches the given job class.
   *
   * @param {Class} Job
   */
  addJob (Job) {
    this.jobs.set(Job.name, Job)
  }

  /**
   * Retrieves a cached job class.
   *
   * @param {String} name
   *
   * @returns {Class}
   */
  getJob (name) {
    return this.jobs.get(name)
  }

  /**
   * Dispatches a job with the given data.
   *
   * @param {Class} job
   * @param {Object} options
   */
  async dispatch (job, { data, connection: connectionName, queue }) {
    const connection = await this.connection(connectionName)

    await connection.push(job, data, queue)
  }

  /**
   * Stops all queue connections.
   */
  async stop () {
    await Collect(
      Array.from(this.connections.values())
    ).forEach(async (connector) => {
      await connector.disconnect()
    })
  }
}

module.exports = new QueueManager()
