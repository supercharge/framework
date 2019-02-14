'use strict'

const Proxyquire = require('proxyquire')
const BaseTest = require('../../../../../testing/base-test')

const ExecaStub = () => {}
const SetupCommand = Proxyquire('../../../../../foundation/console/commands/setup', { 'execa': ExecaStub })

class SetupCommandTest extends BaseTest {
  async signature (t) {
    t.true(SetupCommand.signature.includes('setup'))
  }

  async description (t) {
    t.true(SetupCommand.description.includes('setup for your new application'))
  }

  async serialSetup (t) {
    const command = new SetupCommand()

    const copyStub = this.stub(command, 'copy').returns(() => {})
    const getEnvPathStub = this.stub(command, 'getEnvPath').returns()
    const notInstalledStub = this.stub(command, 'ensureNotInstalled').returns()
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()

    this.muteConsole()

    await command.handle(undefined, { name: 'Superchargetest' })

    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('Your project is ready for take off'))
    t.true(stdout.includes('cd Superchargetest'))

    copyStub.restore()
    getEnvPathStub.restore()
    notInstalledStub.restore()
    ensureInProjectRootStub.restore()
  }

  async serialSetupWithFallbackAppName (t) {
    const command = new SetupCommand()

    const copyStub = this.stub(command, 'copy').returns()
    const getEnvPathStub = this.stub(command, 'getEnvPath').returns()
    const notInstalledStub = this.stub(command, 'ensureNotInstalled').returns()
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()

    this.muteConsole()

    await command.handle(undefined, { })

    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('Your project is ready for take off'))
    t.true(stdout.includes('cd Supercharge'))

    copyStub.restore()
    getEnvPathStub.restore()
    notInstalledStub.restore()
    ensureInProjectRootStub.restore()
  }
}

module.exports = new SetupCommandTest()
