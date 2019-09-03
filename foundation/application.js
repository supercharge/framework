'use strict'

const Path = require('path')
const Env = require('../env')
const Config = require('../config')
const Helper = require('../helper')
const HttpKernel = require('../http/kernel')
const Dispatcher = require('../event/dispatcher')
const ConsoleKernel = require('../console/kernel')
const Bootstrapper = require('./concerns/load-bootstrappers')
const ExceptionHandler = require('./exceptions/handle-system-exceptions')

class Application extends Bootstrapper {
  constructor () {
    super()

    this.httpKernel = null
    this.consoleKernel = null
    this.exceptionHandler = new ExceptionHandler()
  }

  /**
   * Returns the HTTP server instance.
   *
   * @returns {Object}
   */
  get server () {
    return this.httpKernel.getServer()
  }

  /**
   * Returns the console kernel instance.
   *
   * @returns {ConsoleKernel}
   */
  get console () {
    return this.consoleKernel
  }

  /**
   * Set the application root directory to the given `path`.
   *
   * @param {String} path
   */
  fromAppRoot (path) {
    Helper.setAppRoot(path)

    return this
  }

  async puper () {
    await this.listenForSystemErrors()
    await this.loadEnvironmentVariables()
    await this.loadApplicationConfig()
    await this.ensureAppRoot()
    await this.ensureAppKey()
    await this.initializeEvents()

    await this.initializeHttpServer()
    await this.bootstrapConsole()

    await this.registerBootstrappers()
  }

  async listenForSystemErrors () {
    this.exceptionHandler.listenForSystemErrors()
  }

  async loadEnvironmentVariables () {
    Env.loadEnvironmentVariables()
  }

  async loadApplicationConfig () {
    await Config.loadConfigFiles(Path.resolve(Helper.appRoot(), 'config'))
  }

  async ensureAppRoot () {
    if (!Helper.appRoot()) {
      throw new Error('Missing app root directory. Make sure to call .fromAppRoot() when starting your app.')
    }
  }

  async ensureAppKey () {
    if (!Config.get('app.key')) {
      throw new Error(
        'No application key available. Make sure to define the APP_KEY value in your .env file (or generate one with "node craft key:generate")'
      )
    }
  }

  /**
   * Register all application events and assign listeners.
   */
  async initializeEvents () {
    // TODO create event bootstrapper
    await Dispatcher.init()
  }

  /**
   * Initialize the HTTP server instance and
   * register core plugins, middleware, app
   * plugins and configure views.
   */
  async initializeHttpServer () {
    this.httpKernel = new HttpKernel(this)
    await this.httpKernel.bootstrap()
  }

  async bootstrapConsole () {
    this.consoleKernel = new ConsoleKernel(this)
    await this.consoleKernel.bootstrap()
  }

  /**
   * Initialize and bootstrap the application
   * and start the HTTP server.
   */
  async httpWithFullSpeed () {
    await this.puper()
    await this.startServer()
  }

  /**
   * Start the HTTP server.
   */
  async startServer () {
    await this.httpKernel.start()
  }

  async consoleForLife () {
    await this.puper()
    await this.startConsole()
  }

  async startConsole () {
    await this.consoleKernel.invoke()
  }

  isRunningTests () {
    return Env.isTesting()
  }
}

module.exports = Application
