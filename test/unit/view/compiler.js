'use strict'

const Logger = require('../../../logging')
const BaseTest = require('../../../testing/base-test')
const ViewCompiler = require('../../../view/compiler')

class HandlebarsCompilerTest extends BaseTest {
  async failsToRegisterHelper (t) {
    const spy = this.spy(Logger, 'warn')

    const compiler = new ViewCompiler()
    compiler.registerHelper(__dirname, 'not-existent-helper.js')

    t.true(spy.called)
  }
}

module.exports = new HandlebarsCompilerTest()
