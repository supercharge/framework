'use strict'

const Path = require('path')
const Fs = require('../../../../../filesystem')
const Encrypt = require('../../../../../encryption')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const MakeJobCommand = require('../../../../../console/commands/make-job')

class MakeJobCommandTest extends BaseTest {
  beforeEach () {
    const command = new MakeJobCommand()
    this.inProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns(true)
    this.command = command
  }

  alwaysAfterEach () {
    this.inProjectRootStub.restore()
  }

  async signature (t) {
    t.true(MakeJobCommand.signature.includes('make:job'))
  }

  async description (t) {
    t.true(MakeJobCommand.description.includes('Scaffold'))
    t.true(MakeJobCommand.description.includes('new queue job'))
  }

  async serialCopyJobs (t) {
    const tempFile = Path.resolve(__dirname, `fixtures/jobs/testing-job-${Encrypt.randomKey(4)}.js`)

    const helperStub = this.stub(Helper, 'jobsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.handle({ filename: 'testing-job' })
    this.unmuteConsole()

    t.true(await Fs.exists(tempFile))

    helperStub.restore()
    pathExistsStub.restore()
    await Fs.remove(tempFile)
  }

  async serialDontReplaceExistingJobs (t) {
    const tempFile = Path.resolve(__dirname, `fixtures/jobs/testing-job-${Encrypt.randomKey(4)}.js`)
    await Fs.writeFile(tempFile, 'job')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'jobsPath').returns(tempFile)

    this.muteConsole()
    await this.command.handle({ filename: 'testing-job' })
    this.unmuteConsole()

    t.is(await Fs.readFile(tempFile), 'job')

    helperStub.restore()
    confirmStub.restore()
    await Fs.remove(tempFile)
  }

  async serialReplaceExistingJob (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/jobs/testing-job.js')
    await Fs.writeFile(tempFile, 'job')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'jobsPath').returns(tempFile)

    this.muteConsole()
    await this.command.handle({ filename: 'testing-job' })
    this.unmuteConsole()

    const content = await Fs.readFile(tempFile)
    t.true(content.includes('class TestingJob extends Dispatchable {'))

    helperStub.restore()
    confirmStub.restore()
    await Fs.remove(tempFile)
  }

  async serialIsNotAppendingJSSuffixIfExistent (t) {
    const filename = `testing-job-${Encrypt.randomKey(4)}.js`
    const tempFile = Path.resolve(__dirname, `fixtures/jobs/${filename}`)
    await Fs.writeFile(tempFile, 'job')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'jobsPath').returns(tempFile)

    this.muteConsole()
    await this.command.handle({ filename })
    this.unmuteConsole()

    t.true(await Fs.exists(tempFile))

    helperStub.restore()
    confirmStub.restore()
    await Fs.remove(tempFile)
  }
}

module.exports = new MakeJobCommandTest()
