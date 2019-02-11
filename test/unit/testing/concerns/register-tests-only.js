'use strict'

const BaseTest = require('../../../../testing/base-test')

class RegisterTestsTest extends BaseTest {
  async onlyTest (t) {
    t.pass()
  }
}

module.exports = new RegisterTestsTest()
