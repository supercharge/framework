'use strict'

const Path = require('path')
const Fs = require('../../../../../filesystem')
const BaseTest = require('../../../../../base-test')
const KeyGenerateCommand = require('../../../../../src/foundation/console/commands/key-generate')

class KeyGenerateCommandTest extends BaseTest {
  async signature (t) {
    t.true(KeyGenerateCommand.signature.includes('key:generate'))
  }

  async description (t) {
    t.true(KeyGenerateCommand.description.includes('application key'))
  }

  async serialEchoAppKey (t) {
    const command = new KeyGenerateCommand()

    this.muteConsole()
    await command.handle(undefined, { echo: true })
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('Application key:'))
    t.false(stdout.includes('.env'))
  }

  async serialGenerateAppKey (t) {
    const file = Path.resolve(__dirname, 'fixtures/test.env')
    await Fs.ensureFile(file)
    await Fs.writeFile(file, 'NAME=')

    const command = new KeyGenerateCommand()

    const getEnvPathStub = this.stub(command, 'getEnvPath').returns(file)
    const notInstalledStub = this.stub(command, 'ensureNotInstalled').returns()
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()

    this.muteConsole()

    await command.handle(undefined, {})

    const { stdout } = this.consoleOutput()
    t.true(stdout.includes('Application key ['))
    t.true(stdout.includes('set as APP_KEY'))

    const content = await Fs.readFile(file)
    t.true(content.includes('APP_KEY='))

    await Fs.remove(file)

    getEnvPathStub.restore()
    notInstalledStub.restore()
    ensureInProjectRootStub.restore()
  }
}

module.exports = new KeyGenerateCommandTest()
