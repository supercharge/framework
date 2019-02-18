'use strict'

const Path = require('path')
const Fs = require('../../../../../filesystem')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../testing/base-test')
const MakeAuthCommand = require('../../../../../foundation/console/commands/make-auth')

class MakeAuthCommandTest extends BaseTest {
  beforeEach () {
    const command = new MakeAuthCommand()
    this.copyStub = this.stub(command, 'copy').returns()
    this.command = command
  }

  alwaysAfterEach () {
    this.copyStub.restore()
  }

  async signature (t) {
    t.true(MakeAuthCommand.signature.includes('make:auth'))
  }

  async description (t) {
    t.true(MakeAuthCommand.description.includes('Scaffold'))
  }

  async serialMakeAuth (t) {
    const command = new MakeAuthCommand()

    const copyViewsStub = this.stub(command, 'copyViews').returns()
    const copyModelsStub = this.stub(command, 'copyModels').returns()
    const copyRoutesStub = this.stub(command, 'copyRoutes').returns()
    const copyEventsStub = this.stub(command, 'copyEvents').returns()
    const copyStrategiesStub = this.stub(command, 'copyStrategies').returns()
    const ensureInProjectRootStub = this.stub(command, 'ensureInProjectRoot').returns()
    const useAppLayoutInWelcomeRouteStub = this.stub(command, 'useAppLayoutInWelcomeRoute').returns()

    this.muteConsole()
    await command.handle()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('Authentication scaffolding successful'))

    copyViewsStub.restore()
    copyModelsStub.restore()
    copyRoutesStub.restore()
    copyEventsStub.restore()
    copyStrategiesStub.restore()
    ensureInProjectRootStub.restore()
    useAppLayoutInWelcomeRouteStub.restore()
  }

  async serialCopyViews (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/views/testview.hbs')

    const helperStub = this.stub(Helper, 'viewsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.copyViews()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('views/home.hbs'))
    t.true(stdout.includes('views/auth/login.hbs'))
    t.true(stdout.includes('views/auth/signup.hbs'))
    t.true(stdout.includes('views/auth/forgot-password.hbs'))
    t.true(stdout.includes('views/auth/reset-password.hbs'))

    helperStub.restore()
    pathExistsStub.restore()
  }

  async serialDontReplaceExistingViews (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/views/testview.hbs')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'viewsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyViews()
    const { stdout } = this.consoleOutput()

    t.is(stdout, '\n')

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialReplaceExistingViews (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/views/testview.hbs')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'viewsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyViews()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('views/home.hbs'))
    t.true(stdout.includes('views/auth/login.hbs'))
    t.true(stdout.includes('views/auth/signup.hbs'))
    t.true(stdout.includes('views/auth/forgot-password.hbs'))
    t.true(stdout.includes('views/auth/reset-password.hbs'))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialUseAppLayoutInWelcomeRoute (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/routes/welcome.js')

    const helperStub = this.stub(Helper, 'routesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)
    const getFileContentStub = this.stub(this.command, 'getFileContent').returns(
      "h.view('welcome', null, { layout: 'clean' })"
    )

    await this.command.useAppLayoutInWelcomeRoute()

    helperStub.restore()
    pathExistsStub.restore()
    getFileContentStub.restore()

    const content = await Fs.readFile(tempFile)
    t.is(content, "h.view('welcome')")

    await Fs.remove(tempFile)
  }

  async serialSkipAppLayoutUpdateInWelcomeRoute (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/routes/welcome.js')

    const helperStub = this.stub(Helper, 'routesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)
    const getFileContentStub = this.stub(this.command, 'getFileContent').returns()

    await this.command.useAppLayoutInWelcomeRoute()

    helperStub.restore()
    pathExistsStub.restore()
    getFileContentStub.restore()

    t.false(await Fs.pathExists(tempFile))
  }

  async serialCopyModels (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/models/model.js')

    const helperStub = this.stub(Helper, 'modelsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.copyModels()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('models/user.js'))

    helperStub.restore()
    pathExistsStub.restore()
  }

  async serialDontReplaceExistingModels (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/models/model.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'modelsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyModels()
    const { stdout } = this.consoleOutput()

    t.is(stdout, '\n')

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialReplaceExistingModels (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/models/model.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'modelsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyModels()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('models/user.js'))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialCopyRoutes (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/routes/make-auth-route.js')

    const helperStub = this.stub(Helper, 'routesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.copyRoutes()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('routes/home.js'))
    t.true(stdout.includes('routes/auth/login.js'))
    t.true(stdout.includes('routes/auth/signup.js'))
    t.true(stdout.includes('routes/auth/logout.js'))
    t.true(stdout.includes('routes/auth/reset-password.js'))
    t.true(stdout.includes('routes/auth/forgot-password.js'))

    helperStub.restore()
    pathExistsStub.restore()
  }

  async serialDontReplaceExistingRoutes (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/routes/make-auth-route.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'routesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyRoutes()
    const { stdout } = this.consoleOutput()

    t.is(stdout, '\n')

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialReplaceExistingRoutes (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/routes/make-auth-route.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'routesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyRoutes()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('routes/home.js'))
    t.true(stdout.includes('routes/auth/login.js'))
    t.true(stdout.includes('routes/auth/signup.js'))
    t.true(stdout.includes('routes/auth/logout.js'))
    t.true(stdout.includes('routes/auth/reset-password.js'))
    t.true(stdout.includes('routes/auth/forgot-password.js'))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialCopyStrategies (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/auth/strategies/make-auth-strategy.js')

    const helperStub = this.stub(Helper, 'strategiesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.copyStrategies()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('auth/strategies/session.js'))

    helperStub.restore()
    pathExistsStub.restore()
  }

  async serialDontReplaceExistingAuthStrategy (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/auth/strategies/make-auth-strategy.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'strategiesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyStrategies()
    const { stdout } = this.consoleOutput()

    t.is(stdout, '')

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialReplaceExistingAuthStrategy (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/auth/strategies/make-auth-strategy.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'strategiesPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyStrategies()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('auth/strategies/session.js'))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialCopyEvents (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/events/make-auth-event.js')

    const helperStub = this.stub(Helper, 'eventsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(false)

    this.muteConsole()
    await this.command.copyEvents()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('events/auth/user-registered.js'))

    helperStub.restore()
    pathExistsStub.restore()
  }

  async serialDontReplaceExistingEvents (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/events/make-auth-event.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(false)
    const helperStub = this.stub(Helper, 'eventsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyEvents()
    const { stdout } = this.consoleOutput()

    t.is(stdout, '')

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }

  async serialReplaceExistingEvents (t) {
    const tempFile = Path.resolve(__dirname, 'fixtures/events/make-auth-event.js')

    const confirmStub = this.stub(this.command, 'confirm').returns(true)
    const helperStub = this.stub(Helper, 'eventsPath').returns(tempFile)
    const pathExistsStub = this.stub(this.command, 'pathExists').returns(true)

    this.muteConsole()
    await this.command.copyEvents()
    const { stdout } = this.consoleOutput()

    t.true(stdout.includes('events/auth/user-registered.js'))

    helperStub.restore()
    confirmStub.restore()
    pathExistsStub.restore()
  }
}

module.exports = new MakeAuthCommandTest()
