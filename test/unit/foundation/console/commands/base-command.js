'use strict'

const Path = require('path')
const Fs = require('../../../../../filesystem')
const BaseTest = require('../../../../../base-test')
const BaseCommand = require('../../../../../src/foundation/console/commands/base-command')

class BaseCommandTest extends BaseTest {
  async serialRunFailsWhenCallbackThrows (t) {
    const command = new BaseCommand()

    const processExitStub = this.stub(process, 'exit')
    const pathExistsstub = this.stub(command, 'pathExists').returns(true)

    const errorMessage = 'base command error message'
    const handler = () => { throw new Error(errorMessage) }

    this.muteConsole()
    await command.run(handler)
    const { stderr } = this.consoleOutput()

    t.true(stderr.includes(errorMessage))

    this.sinon().assert.called(processExitStub)

    pathExistsstub.restore()
    processExitStub.restore()
  }

  async serialRun (t) {
    const command = new BaseCommand()

    const processExitStub = this.stub(process, 'exit')
    const pathExistsstub = this.stub(command, 'pathExists').returns(true)

    await command.run(() => { })

    this.sinon().assert.notCalled(processExitStub)

    pathExistsstub.restore()
    processExitStub.restore()

    t.pass()
  }

  async failsToEnsureInProjectRoot (t) {
    const command = new BaseCommand()

    const error = await t.throwsAsync(command.ensureInProjectRoot())
    t.true(error.message.includes('Make sure you are inside a Supercharge app'))
  }

  async ensureInProjectRoot (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'pathExists').returns(true)
    await command.ensureInProjectRoot()
    stub.restore()
    t.pass()
  }

  async failsToEnsureNotInstalledWhenEnvFileExists (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'pathExists').returns(true)

    const error = await t.throwsAsync(command.ensureNotInstalled())
    t.true(error.message.includes('already includes a .env file'))

    stub.restore()
  }

  async ensureNotInstalled (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'pathExists').returns(false)
    await command.ensureNotInstalled()
    stub.restore()
    t.pass()
  }

  async ensureNotInstalledWithForce (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'pathExists').returns(true)

    this.muteConsole()
    await command.ensureNotInstalled(true)
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('Found existing app setup'))
    stub.restore()
  }

  async getEnvPathWithFileName (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'ensureFile').returns()
    const path = await command.getEnvPath('env.file')
    t.true(path.includes('env.file'))
    stub.restore()
  }

  async getEnvPathWithFileFallback (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'ensureFile').returns()
    const path = await command.getEnvPath()
    t.true(path.includes('.env'))
    stub.restore()
  }

  async getEnvPathFromAbsoluteFilePath (t) {
    const command = new BaseCommand()
    const stub = this.stub(command, 'ensureFile').returns()

    const absolutePath = Path.resolve(__dirname, 'env.file')
    const path = await command.getEnvPath(absolutePath)

    t.is(path, absolutePath)

    stub.restore()
  }

  async getFileContent (t) {
    const command = new BaseCommand()
    const content = await command.getFileContent(Path.resolve(__dirname, 'fixtures/testfile.txt'))
    t.true(content.includes('Supercharge'))
  }

  async serialUpdateEnvContents (t) {
    const file = Path.resolve(__dirname, 'fixtures/test.env')
    await Fs.ensureFile(file)
    await Fs.writeFile(file, 'NAME=')

    const command = new BaseCommand()
    await command.updateEnvContents(file, { NAME: 'Supercharge' })

    t.is(await Fs.readFile(file), 'NAME=Supercharge')

    await Fs.remove(file)
  }
}

module.exports = new BaseCommandTest()
