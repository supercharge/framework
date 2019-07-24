'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const App = require('../../../foundation/application')

class AppLifecycleTest extends BaseTest {
  constructor () {
    super()
    this.appRoot = Path.resolve(__dirname, '..', '..', '..')
  }

  async before () {
    Config.set('app.key', 'a'.repeat(32))

    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/helpers'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/layouts'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/partials'))

    this.stub(console, 'error')
    this.stub(process, 'exit')
  }

  async alwaysAfter () {
    console.error.restore()
    process.exit.restore()

    await Fs.remove(
      Path.resolve(this.appRoot, 'resources/views')
    )
  }

  async serialStartsAndStopsDefaultServer (t) {
    const app = new App().fromAppRoot(this.appRoot)
    await app.bootstrapHttpKernel()
    await app.startServer()

    const server = app.getServer()
    t.not(server.info.started, 0)

    process.emit('SIGTERM')
    await new Promise(resolve => setTimeout(resolve, 100))

    t.is(server.info.started, 0)
  }

  async serialFailsToStartServer (t) {
    const app = new App().fromAppRoot(this.appRoot)
    await app.bootstrapHttpKernel()
    await app.startServer()

    const server = app.getServer()
    const stub = this.stub(server, 'start').throws(new Error())

    await app.startServer()

    this.sinon().assert.called(console.error)
    this.sinon().assert.called(process.exit)
    stub.restore()

    t.pass()
  }

  async serialRunsShutdownFunctions (t) {
    const app = new App().fromAppRoot(this.appRoot)
    await app.bootstrapHttpKernel()

    const server = app.getServer()
    const stub = this.stub(server, 'start').throws(new Error())

    await app.startServer()

    this.sinon().assert.called(console.error)
    this.sinon().assert.called(process.exit)
    stub.restore()

    t.pass()
  }
}

module.exports = new AppLifecycleTest()
