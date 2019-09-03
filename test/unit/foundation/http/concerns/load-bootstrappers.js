'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const Logger = require('../../../../../logging')
const BaseTest = require('../../../../../base-test')
const Application = require('../../../../../foundation/application')

class LoadBootstrappers extends BaseTest {
  async serialLoadBootstrappers (t) {
    const app = new Application()

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))

    app._bootstrapperFile = 'is-array.js'

    const bootstrappers = await app.loadUserlandBootstrappers()
    t.deepEqual(bootstrappers, [require('./fixtures/bootstrappers/test-bootstrapper.js')])
  }

  async seriaLogsDebugWhenMissingBootstrapperFile (t) {
    const app = new Application()
    app._bootstrapperFile = 'not-existing.js'

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))

    const stub = this.stub(Logger, 'debug').returns()

    await app.loadUserlandBootstrappers()
    t.true(stub.called)

    stub.restore()
  }

  async serialLogsErrorWhenNotArrayBootstrappers (t) {
    const app = new Application()
    app._bootstrapperFile = 'not-array.js'

    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/bootstrappers'))

    const stub = this.stub(Logger, 'error').returns()

    await app.loadUserlandBootstrappers()
    t.true(stub.called)

    stub.restore()
  }
}

module.exports = new LoadBootstrappers()
