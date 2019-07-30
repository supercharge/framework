'use strict'

const Crypto = require('crypto')
const Config = require('../config')
const SimpleEncryptor = require('simple-encryptor')

class Encryption {
  /**
   * Create a new Encrypter instance.
   *
   * @param {String} key
   * @param {Object} options
   */
  constructor (key = Config.get('app.key'), options) {
    if (!key) {
      throw new Error('Encryption key missing. Define the app key in your config/app.js file.')
    }

    this.key = key
    this.encryptor = SimpleEncryptor(Object.assign({}, { key }, options))
  }

  /**
   * Create an encryption key for the given cipher.
   *
   * @param {String} cipher
   *
   * @returns {String}
   */
  static generateKey (cipher = Config.get('app.cipher')) {
    const bytes = cipher === 'AES-128-CBC' ? 16 : 32

    return Encryption.randomKey(bytes)
  }

  /**
   * Generate a random key with the given length in bytes.
   *
   * @param {String} bytes
   *
   * @returns {String}
   */
  static randomKey (bytes = 20) {
    return Crypto
      .randomBytes(Math.ceil(bytes * 0.75))
      .toString('base64')
      .slice(0, bytes)
  }

  /**
   * Get the encryption key.
   *
   * @returns {String}
   */
  getKey () {
    return this.key
  }

  /**
   * Encrypt the given value using the
   * app key as encryption key.
   *
   * @param {String} value
   *
   * @returns {*}
   */
  static encrypt (value) {
    return new Encryption().encrypt(value)
  }

  /**
   * Encrypt the given value.
   *
   * @param {*} value
   *
   * @returns {String}
   */
  encrypt (value) {
    return this.encryptor.encrypt(value)
  }

  /**
   * Decrypt the given value using the
   * app key as decryption key.
   *
   * @param {String} value
   *
   * @returns {*}
   */
  static decrypt (value) {
    return new Encryption().decrypt(value)
  }

  /**
   * Decrypt the given value.
   *
   * @param {String} value
   *
   * @returns {*}
   */
  decrypt (value) {
    return this.encryptor.decrypt(value)
  }

  /**
   * Calculate the HMAC of the given string.
   *
   * @param {String} string
   *
   * @returns {String}
   */
  static hmac (string) {
    return new Encryption().hmac(string)
  }

  /**
   * Calculate the HMAC of the given string.
   *
   * @param {String} string
   *
   * @returns {String}
   */
  hmac (string) {
    return this.encryptor.hmac(string)
  }

  /**
   * Base64 encode the given value.
   *
   * @param {*} value
   *
   * @returns {String}
   */
  static base64Encode (value) {
    return Buffer.from(value).toString('base64')
  }

  /**
   * Decode a base64 encoded string.
   *
   * @param {*} value
   *
   * @returns {String}
   */
  static base64Decode (value) {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64')

    return buffer.toString('utf8')
  }
}

module.exports = Encryption
