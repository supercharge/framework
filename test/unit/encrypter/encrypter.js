'use strict'

const Config = require('../../../config')
const Encrypter = require('../../../encryption')
const BaseTest = require('../../../testing/base-test')

class EncrypterTest extends BaseTest {
  async encryptString (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const encrypted = encrypter.encrypt('Supercharge')
    t.not(encrypted, 'Supercharge')
    t.is(encrypter.decrypt(encrypted), 'Supercharge')
  }

  async encryptObject (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const encrypted = encrypter.encrypt({ Supercharge: 'is awesome' })
    t.not(encrypted, 'Supercharge')
    t.deepEqual(encrypter.decrypt(encrypted), { Supercharge: 'is awesome' })
  }

  async generateKeyForAES128 (t) {
    const key = Encrypter.generateKey('AES-128-CBC')
    t.truthy(key)
    t.is(key.length, 16)
  }

  async generateKeyForAES256 (t) {
    const key = Encrypter.generateKey('AES-256-CBC')
    t.truthy(key)
    t.is(key.length, 32)
  }

  async generateKeyForRandomCipher (t) {
    const key = Encrypter.generateKey('RANDOM-CIPHER')
    t.truthy(key)
    t.is(key.length, 32)
  }

  async generateKey (t) {
    const key = Encrypter.generateKey()
    t.truthy(key)
    t.is(key.length, 32)
  }

  async randomKey (t) {
    const key = Encrypter.randomKey(16)
    t.truthy(key)
    t.is(key.length, 16)
  }

  async randomKeyWithDefaultLength (t) {
    const key = Encrypter.randomKey()
    t.truthy(key)
    t.is(key.length, 20)
  }

  async getKey (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const key = encrypter.getKey()
    t.is(key, 'a'.repeat(32))
  }

  async hmac (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const hmac = encrypter.hmac('Supercharge is awesome')
    t.not(hmac, null)
  }

  async base64EncodeString (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const encoded = encrypter.base64Encode('Supercharge is awesome')
    t.deepEqual(encrypter.base64Decode(encoded), 'Supercharge is awesome')
  }

  async base64EncodeBuffer (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const encoded = encrypter.base64Encode(Buffer.from('Supercharge is awesome'))
    t.deepEqual(encrypter.base64Decode(encoded), 'Supercharge is awesome')
  }

  async base64DecodeBuffer (t) {
    const encrypter = new Encrypter('a'.repeat(32))
    const encoded = encrypter.base64Encode(Buffer.from('Supercharge is awesome'))
    t.deepEqual(encrypter.base64Decode(Buffer.from(encoded, 'base64')), 'Supercharge is awesome')
  }

  async failsWithoutEncryptionKey (t) {
    t.throws(() => new Encrypter(null))
  }

  async usesAppKeyAsEncryptionKey (t) {
    Config.set('app.key', 'a'.repeat(32))
    t.truthy(new Encrypter())
    Config.set('app.key', undefined)
  }

  async failsWithTooShortEncryptionKey (t) {
    t.throws(() => new Encrypter('a'.repeat(5)))
  }
}

module.exports = new EncrypterTest()
