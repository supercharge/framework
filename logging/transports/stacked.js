'use strict'

const FileLogger = require('./file')
const ConsoleLogger = require('./console')

class StackedTransport {
  /**
   * Create a Winston transporter with multiple outputs.
   *
   * @returns {Object}
   */
  createTransporter () {
    return [
      new FileLogger().createTransporter(),
      new ConsoleLogger().createTransporter()
    ]
  }
}

module.exports = StackedTransport
