'use strict'

const Path = require('path')
const Fs = require('../../../../../filesystem')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const MakeRouteCommand = require('../../../../../src/foundation/console/commands/make-route')

class MakeRouteCommandTest extends BaseTest {
  async signature (t) {
    t.true(MakeRouteCommand.signature.includes('make:route'))
  }

  async description (t) {
    t.true(MakeRouteCommand.description.includes('new route'))
  }

  async serialMakeRoute (t) {
    const command = new MakeRouteCommand()

    const testfile = Path.resolve(__dirname, 'fixtures/routes/testroute.js')

    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()
    const helperStub = this.stub(Helper, 'routesPath').returns(testfile)

    this.muteConsole()
    await command.handle({ filename: 'testroute' })
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('routes/testroute.js'))
    t.false(stdout.includes('.env'))

    const content = await Fs.readFile(testfile)
    t.true(content.includes('path: \'/testroute\''))

    helperStub.restore()
    ensureInProjectRootStub.restore()

    await Fs.remove(testfile)
  }

  async serialMakeRouteWithExistingFile (t) {
    const command = new MakeRouteCommand()

    const testfile = Path.resolve(__dirname, 'fixtures/routes/testroute.js')

    const pathExistsStub = this.stub(command, 'pathExists').returns(true)
    const confirmStub = this.stub(command, 'confirm').returns(true)
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()
    const helperStub = this.stub(Helper, 'routesPath').returns(testfile)

    this.muteConsole()
    await command.handle({ filename: 'testroute' })
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('routes/testroute.js'))
    t.false(stdout.includes('.env'))

    const content = await Fs.readFile(testfile)
    t.true(content.includes('path: \'/testroute\''))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
    ensureInProjectRootStub.restore()

    await Fs.remove(testfile)
  }

  async serialSkipMakeRouteWhenNotConfirmed (t) {
    const command = new MakeRouteCommand()

    const confirmStub = this.stub(command, 'confirm').returns(false)
    const pathExistsStub = this.stub(command, 'pathExists').returns(true)
    const getFileContentStub = this.stub(command, 'getFileContent').returns(true)

    this.muteConsole()
    await command.handle({ filename: 'testroute' })
    const { stdout } = this.consoleOutput()

    t.is(stdout, '')

    this.sinon().assert.notCalled(getFileContentStub)

    confirmStub.restore()
    pathExistsStub.restore()
    getFileContentStub.restore()
  }
}

module.exports = new MakeRouteCommandTest()
