'use strict'

const MongooseClient = require('./database-queue-mongoose-client')

class DatabaseQueueClientFaktory {
  /**
   * Creates the database queue client to insert,
   * fetch, or count queue jobs.
   *
   * @param {String} driver
   *
   * @returns {DtabaseQueueClient}
   */
  static make (driver) {
    switch (driver) {
      case 'mongoose':
        return MongooseClient

      default:
        throw new Error(`Unknown database queue driver ${driver}`)
    }
  }
}

module.exports = DatabaseQueueClientFaktory
