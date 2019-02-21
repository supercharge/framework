'use strict'

const BaseTest = require('../../../base-test')
const Hashinator = require('../../../src/hashing/argon-hashinator')

class ArgonHashinatorTest extends BaseTest {
  async makeArgonHash (t) {
    const hasher = new Hashinator()
    t.truthy(await hasher.make('Supercharge'))
  }

  async verifyArgonHash (t) {
    const hasher = new Hashinator()
    const hash = await hasher.make('Supercharge')
    t.true(await hasher.check('Supercharge', hash))
  }
}

module.exports = new ArgonHashinatorTest()
