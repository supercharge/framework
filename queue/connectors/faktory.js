'use strict'

const Faktory = require('faktory-worker')
const FaktoryQueue = require('../faktory-queue')

class FaktoryConnector {
  async connect (config) {
    const client = await Faktory.connect(config)

    return new FaktoryQueue(client)
  }
}

module.exports = FaktoryConnector
