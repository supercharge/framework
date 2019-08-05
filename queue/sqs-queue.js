'use strict'

class SqsQueue {
  constructor (sqsClient) {
    this.client = sqsClient
  }

  async push (job, data) {
    //
  }

  async pop (...queues) {
    //
  }

  async size () {
    //
  }
}

module.exports = SqsQueue
