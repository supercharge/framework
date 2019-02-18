'use strict'

const BaseTest = require('../../../../testing/base-test')

class AvaDriverTest extends BaseTest {
  _testMethod () {
  }

  async serialAvaTest (t) {
    t.pass()
  }

  async skipAvaTest (t) {
    t.pass()
  }

  async todoAvaTest (t) {
    t.pass()
  }

  async failingAvaTest (t) {
    t.fail()
  }

  async onlyWillPass (t) {
    t.pass()
  }
}

module.exports = new AvaDriverTest()
