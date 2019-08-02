'use strict'

const Uuid = require('uuid/v4')

class Job {
  constructor ({ id = Uuid(), queue }) {
    this.id = id
    this.progress = 0
    this.queue = queue
    this.status = 'created'
  }

  async handle () {
    throw new Error(`${this.contructor.name} must implement a handle() function.`)
  }

  static dispatch (data) {
    // Queue.dispatch(this, data)
  }
}

module.exports = Job
