'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Config = require('../../../config')
const Helper = require('../../../helper')
const BaseTest = require('../../../testing/base-test')
const Application = require('../../../foundation/application')

class BaseRoutesTest extends BaseTest {
  constructor () {
    super()
    this.appRoot = Path.resolve(__dirname, 'fixtures')
  }

  async beforeEach () {
    Config.set('app.key', 'a'.repeat(32))
  }

  async before () {
    this.helperStub = this.stub(Helper, 'resourcePath').returns(
      Path.resolve(this.appRoot, 'resources', 'views')
    )

    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/helpers'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/layouts'))
    await Fs.ensureDir(Path.resolve(this.appRoot, 'resources/views/partials'))
  }

  async alwaysAfter () {
    this.helperStub.restore()

    await Fs.remove(
      Path.resolve(this.appRoot, 'resources')
    )
  }

  async serialThrowsWithoutAppRootForHttp (t) {
    const app = new Application()
    await t.throwsAsync(app.httpWithFullSpeed())
  }

  async serialThrowsWithoutAppKey (t) {
    Config.set('app.key', null)
    const app = new Application().fromAppRoot(this.appRoot)
    await t.throwsAsync(app.httpWithFullSpeed())
  }

  async serialStartsHttpApplication (t) {
    const app = new Application().fromAppRoot(this.appRoot)
    await app.httpWithFullSpeed()

    t.truthy(app.getServer().info.started)

    await app.getServer().stop()
  }

  async serialStartsConsoleApplication (t) {
    this.muteConsole()
    process.argv = ['node']

    const app = new Application().fromAppRoot(this.appRoot)
    await app.consoleForLife()

    const { stdout, stderr } = this.consoleOutput()
    t.true(stdout.includes('Available Commands'))
    t.falsy(stderr)
  }

  async serialThrowsWithoutAppRootForConsole (t) {
    const app = new Application()
    await t.throwsAsync(app.consoleForLife())
  }
}

module.exports = new BaseRoutesTest()
