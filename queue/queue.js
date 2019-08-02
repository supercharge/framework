'use strict'

const QueueManager = require('./')
const EventDispatcher = require('../event/dispatcher')

class Queue extends EventDispatcher {
  constructor (name, driverName) {
    super()

    this.name = name
    this.driverName = driverName
    this.manager = QueueManager
  }

  config () {
    return this.manager.config()
  }

  async driver () {
    this.manager.driver(this.driverName)
  }

  withPrefix (key) {
    const { prefix } = this.config()

    return `${prefix}:${key}`
  }

  getNextJob () {
    //
  }
}

module.exports = Queue
