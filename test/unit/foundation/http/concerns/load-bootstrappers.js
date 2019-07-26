'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const Logger = require('../../../../../logging')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../http/kernel')
const Application = require('../../../../../foundation/application')

class LoadBootstrappers extends BaseTest {
  async loadBootstrappers (t) {
    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._loadAndRegisterPlugins()

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))
    kernel.bootstrapperFile = 'is-array.js'

    const bootstrappers = await kernel._loadUserlandBootstrappers()
    t.deepEqual(bootstrappers, [require('./fixtures/bootstrappers/test-bootstrapper.js')])
  }

  async logsDebugWhenMissingBootstrapperFile (t) {
    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._loadAndRegisterPlugins()

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))
    kernel.bootstrapperFile = 'not-existing.js'

    const stub = this.stub(Logger, 'debug').returns()

    await kernel._loadUserlandBootstrappers()
    t.true(stub.called)

    stub.restore()
  }

  async logsErrorWhenNotArrayBootstrappers (t) {
    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._loadAndRegisterPlugins()

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))
    kernel.bootstrapperFile = 'not-array.js'

    const stub = this.stub(Logger, 'error').returns()

    await kernel._loadUserlandBootstrappers()
    t.true(stub.called)

    stub.restore()
  }
}

module.exports = new LoadBootstrappers()
