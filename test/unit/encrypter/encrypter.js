'use strict'

const Config = require('../../../config')
const Encrypter = require('../../../encryption')
const BaseTest = require('../../../base-test')

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

  async encryptDecryptStatic (t) {
    Config.set('app.key', 'a'.repeat(32))
    const value = 'supercharge'
    t.deepEqual(value, Encrypter.decrypt(Encrypter.encrypt(value)))
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
    const value = 'Supercharge is awesome'

    const encrypter = new Encrypter('a'.repeat(32))
    const hmac = encrypter.hmac(value)

    Config.set('app.key', 'a'.repeat(32))
    t.deepEqual(hmac, Encrypter.hmac(value))
  }

  async base64EncodeString (t) {
    const encoded = Encrypter.base64Encode('Supercharge is awesome')
    t.deepEqual(Encrypter.base64Decode(encoded), 'Supercharge is awesome')
  }

  async base64EncodeBuffer (t) {
    const encoded = Encrypter.base64Encode(Buffer.from('Supercharge is awesome'))
    t.deepEqual(Encrypter.base64Decode(encoded), 'Supercharge is awesome')
  }

  async base64DecodeBuffer (t) {
    const encoded = Encrypter.base64Encode(Buffer.from('Supercharge is awesome'))
    t.deepEqual(Encrypter.base64Decode(Buffer.from(encoded, 'base64')), 'Supercharge is awesome')
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
