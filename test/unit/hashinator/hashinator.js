'use strict'

const Hash = require('@root/hashing')
const Config = require('@root/config')
const BaseTest = require('@root/testing/base-test')

class HashinatorTest extends BaseTest {
  async makeHash (t) {
    const hash = await Hash.make('Supercharge')
    t.truthy(hash)
  }

  async verifyHash (t) {
    const hash = await Hash.make('Supercharge')
    t.true(await Hash.check('Supercharge', hash))
  }

  async md5 (t) {
    const hash = await Hash.md5('Supercharge')
    t.truthy(hash)
  }

  async selectHashinatorBasedOnConfig (t) {
    Config.set('hashing.driver', 'bcrypt')
    const BcryptHasher = new Hash.constructor()
    const bcryptHash = await BcryptHasher.make('Supercharge')

    Config.set('hashing.driver', 'argon')
    const ArgonHasher = new Hash.constructor()
    const argonHash = await ArgonHasher.make('Supercharge')

    t.not(bcryptHash, argonHash)
  }
}

module.exports = new HashinatorTest()
