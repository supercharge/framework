'use strict'

const Crypto = require('crypto')
const Config = require('../config')
const ArgonHashinator = require('./argon-hashinator')
const BcryptHashinator = require('./bcrypt-hashinator')

class Hashinator {
  /**
   * Initialize the hashing driver.
   */
  constructor () {
    const driver = Config.get('hashing.driver')

    if (driver === 'argon') {
      this.hasher = new ArgonHashinator()
      return
    }

    this.hasher = new BcryptHashinator()
  }

  /**
   * Hash the `value` using the given driver.
   *
   * @param {String} value
   *
   * @returns {String}
   */
  async make (value) {
    return this.hasher.make(value)
  }

  /**
   * Compare a the plain-text `value` against an
   * existing hash. The returned promise never
   * rejects and always returns a boolean value.
   *
   * @param {String} value
   * @param {String} hash
   *
   * @returns {Boolean}
   */
  async check (value, hash) {
    return this.hasher.check(value, hash)
  }

  /**
   * Create an MD5 hash of the given `value`.
   *
   * @param {String|Buffer} value
   *
   * @returns {String}
   */
  md5 (value, encoding = 'hex') {
    return Crypto
      .createHash('md5')
      .update(value)
      .digest(encoding)
  }

  /**
   * Creates a SHA256 hash of the given `value`.
   *
   * @param {String} value
   * @param {String} encoding
   *
   * @returns {String}
   */
  sha256 (value, encoding = 'hex') {
    return Crypto
      .createHash('sha256')
      .update(value)
      .digest(encoding)
  }

  /**
   * Creates a SHA512 hash of the given `value`.
   *
   * @param {String} value
   * @param {String} encoding
   *
   * @returns {String}
   */
  sha512 (value, encoding = 'hex') {
    return Crypto
      .createHash('sha512')
      .update(value)
      .digest(encoding)
  }
}

module.exports = new Hashinator()
