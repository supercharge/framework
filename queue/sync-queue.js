'use strict'

class SyncQueue {
  connect () {
    return this
  }

  disconnect () {
    //
  }

  async push (job, data) {
    console.log('handle sync job')
    console.log(job)
    console.log(data)
  }

  async pop () {
    //
  }

  async size () {
    return 0
  }
}

module.exports = SyncQueue
