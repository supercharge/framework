'use strict'

const Uuid = require('uuid/v4')
const PendingDispatch = require('./pending-dispatch')

class Dispatchable {
  constructor () {
    this.id = Uuid()
    this.queue = null
    this.progress = 0
    this.status = 'created'
  }

  async handle () {
    throw new Error(`${this.contructor.name} must implement a handle() function.`)
  }

  static async dispatch (data) {
    return new PendingDispatch(this).dispatch(data)
  }

  static onQueue (queue) {
    return new PendingDispatch(this).onQueue(queue)
  }
}

module.exports = Dispatchable
