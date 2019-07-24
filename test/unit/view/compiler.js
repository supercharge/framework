'use strict'

const Path = require('path')
const Logger = require('../../../logging')
const BaseTest = require('../../../base-test')
const ViewCompiler = require('../../../view/compiler')

class HandlebarsCompilerTest extends BaseTest {
  async serialFailsToRegisterHelper (t) {
    const stub = this.stub(Logger, 'warn').returns()

    const compiler = new ViewCompiler()
    compiler.registerHelper(__dirname, 'not-existent-helper.js')

    t.true(stub.called)

    stub.restore()
  }

  async serialRegistersViewHelper (t) {
    const stub = this.stub(Logger, 'warn').returns()
    const helpersPath = Path.resolve(__dirname, 'fixtures')

    const compiler = new ViewCompiler()
    compiler.registerHelper(helpersPath, 'test-helper.js')

    t.true(compiler.hasHelper('test-helper'))
    t.true(stub.notCalled)

    stub.restore()
  }

  async ignoresDotfiles (t) {
    const stub = this.stub(Logger, 'debug').returns()

    const compiler = new ViewCompiler()
    compiler.registerHelper('helpers-path', '.git')

    t.false(compiler.hasHelper('.git'))
    t.true(stub.notCalled)

    stub.restore()
  }

  async serialWillNotRegisterViewHelperAndNotFail (t) {
    const stub = this.stub(Logger, 'warn').returns()
    const helpersPath = Path.resolve(__dirname, 'fixtures')

    const compiler = new ViewCompiler()
    compiler.registerHelper(helpersPath, 'no-function-test-helper.js')

    t.false(compiler.hasHelper('no-function-test-helper'))
    t.true(stub.calledOnce)

    stub.restore()
  }
}

module.exports = new HandlebarsCompilerTest()
