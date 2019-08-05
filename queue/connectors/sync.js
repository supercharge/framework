'use strict'

const SyncQueue = require('../sync-queue')

class SyncConnector {
  connect () {
    return new SyncQueue()
  }
}

module.exports = SyncConnector
