'use strict'

const BaseTest = require('../../../../../base-test')
const AppNameCommand = require('../../../../../console/commands/app-name')

class AppNameCommandTest extends BaseTest {
  async signature (t) {
    t.true(AppNameCommand.signature.includes('app:name'))
  }

  async description (t) {
    t.true(AppNameCommand.description.includes('application name'))
  }

  async asksForAppName (t) {
    const command = new AppNameCommand()

    const askStub = this.stub(command, 'ask').returns('')
    const runStub = this.stub(command, 'run').returns()

    await command.handle({})

    this.sinon().assert.called(askStub)

    askStub.restore()
    runStub.restore()

    t.pass()
  }

  async setsAppName (t) {
    const command = new AppNameCommand()

    const askStub = this.stub(command, 'ask').returns('')
    const getEnvPathStub = this.stub(command, 'getEnvPath').returns()
    const updateEnvContentsStub = this.stub(command, 'updateEnvContents').returns()
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns(true)

    this.muteConsole()
    await command.handle({ name: 'test-app-name' })

    this.sinon().assert.notCalled(askStub)
    this.sinon().assert.called(getEnvPathStub)
    this.sinon().assert.called(updateEnvContentsStub)

    askStub.restore()
    getEnvPathStub.restore()
    updateEnvContentsStub.restore()
    ensureInProjectRootStub.restore()

    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('Your application name is now: test-app-name'))
  }
}

module.exports = new AppNameCommandTest()
