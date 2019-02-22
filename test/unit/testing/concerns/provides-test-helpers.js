'use strict'

const BaseTest = require('../../../../base-test')

class ProvidesTestHelpersTest extends BaseTest {
  async generateRandomKey (t) {
    t.truthy(this.randomKey())
  }

  async randomKeyWithLength (t) {
    const key = this.randomKey(10)
    t.true(key.length === 10)
  }
}

module.exports = new ProvidesTestHelpersTest()
