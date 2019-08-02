'use strict'

const Config = require('../config')
const Drivers = require('./driver')
const Manager = require('../foundation/manager')

class QueueManager extends Manager {
  constructor () {
    super(Drivers)

    this.queues = new Map()
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

  async connect (name = this._defaultDriver()) {
    return this.driver(name)
  }

  _createQueueForJob (Job) {
    this.queues.set(Job.name, Job)
  }
}

module.exports = new QueueManager()
