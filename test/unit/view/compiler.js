'use strict'

const Path = require('path')
const Logger = require('../../../logging')
const BaseTest = require('../../../testing/base-test')
const ViewCompiler = require('../../../view/compiler')

class HandlebarsCompilerTest extends BaseTest {
  async failsToRegisterHelper (t) {
    const spy = this.spy(Logger, 'warn')

    const compiler = new ViewCompiler()
    compiler.registerHelper(__dirname, 'not-existent-helper.js')

    t.true(spy.called)

    spy.restore()
  }

  async registersViewHelper (t) {
    const spy = this.spy(Logger, 'warn')
    const helpersPath = Path.resolve(__dirname, 'fixtures')

    const compiler = new ViewCompiler()
    compiler.registerHelper(helpersPath, 'test-helper.js')

    t.true(compiler.hasHelper('test-helper'))
    t.true(spy.notCalled)

    spy.restore()
  }
}

module.exports = new HandlebarsCompilerTest()
