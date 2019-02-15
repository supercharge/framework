'use strict'

const BaseTest = require('../../../../testing/base-test')

class AvaDriverTest extends BaseTest {
  _testMethod () {
  }

  async serialAvaTest (t) {
    t.pass()
  }

  async skipAvaTest (t) {
    t.fail()
  }

  async todoAvaTest (t) {
    t.fail()
  }

  async failingAvaTest (t) {
    t.fail()
  }

  async onlyWillPass (t) {
    t.pass()
  }
}

module.exports = new AvaDriverTest()
