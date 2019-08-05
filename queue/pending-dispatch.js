'use strict'

const QueueManager = require('.')

class PendingDispatch {
  constructor (dispatchable) {
    this.queue = null
    this.dispatchable = dispatchable
  }

  async dispatch (data) {
    return QueueManager.dispatch(this.dispatchable, data, this.queue)
  }

  onQueue (queue) {
    this.queue = queue

    return this
  }
}

module.exports = PendingDispatch
