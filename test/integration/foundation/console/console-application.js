'use strict'

const Config = require('../../../../config')
const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')

class ApplicationTest extends BaseTest {
  async serialStartsConsoleApplicationWithAppKey (t) {
    Config.set('app.key', 'a'.repeat(32))

    this.muteConsole()
    process.argv = ['node']

    await new Application().consoleForLife()

    const { stdout, stderr } = this.consoleOutput()
    t.true(stdout.includes('Available Commands'))
    t.falsy(stderr)
  }

  async serialStartsConsoleApplicationWithoutAppKey (t) {
    Config.set('app.key', null)

    this.muteConsole()
    process.argv = ['node']

    const app = await new Application().consoleForLife()
    t.truthy(app.console)

    const { stdout, stderr } = this.consoleOutput()
    t.true(stdout.includes('Available Commands'))
    t.falsy(stderr)
  }
}

module.exports = new ApplicationTest()
