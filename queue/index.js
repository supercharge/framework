'use strict'

const Config = require('../config')

class QueueManager {
  constructor () {
    this.queues = new Map()
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

  addConnector (name, connector) {
    this.connectors.set(name, connector)
  }

  async connection (name = this._defaultDriver()) {
    if (!this.hasConnection(name)) {
      this.connections.set(name, await this.resolveConnection(name))
    }

    return this.connections.get(name)
  }

  hasConnection (name) {
    return this.connections.has(name)
  }

  async resolveConnection (name) {
    const config = Config.get(`queue.connections.${name}`)

    return this.getConnector(name).connect(config)
  }

  getConnector (name) {
    if (!this.hasConnector(name)) {
      throw new Error(`Missing queue connector for driver "${name}`)
    }

    return this.resolveConnector(name)
  }

  resolveConnector (name) {
    const Connector = this.connectors.get(name)

    return new Connector()
  }

  hasConnector (name) {
    return this.connectors.has(name)
  }

  _createQueueForJob (Job) {
    this.queues.set(Job.name, Job)
  }

  async dispatch (job, data, queue) {
    const connection = await this.connection()

    connection.push(job.name, data, queue)
  }
}

module.exports = new QueueManager()
