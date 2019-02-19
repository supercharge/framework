'use strict'

const Encryption = require('../../encryption')

class ProvidesTestHelpers {
  /**
   * Generates a random key.
   *
   * @returns {String}
   */
  randomKey (bytes) {
    return Encryption.randomKey(bytes)
  }
}

module.exports = ProvidesTestHelpers
