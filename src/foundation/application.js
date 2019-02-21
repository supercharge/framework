'use strict'

const Path = require('path')
const Env = require('./../env')
const Config = require('./../config')
const Helper = require('./../helper')
const HttpKernel = require('./http/kernel')
const ConsoleKernel = require('./console/kernel')
const Dispatcher = require('../event/dispatcher')
const ExceptionHandler = require('./exceptions/handle-system-exceptions')

class Application {
  constructor () {
    this.server = null
    this.appRoot = null
    this.exceptionHandler = new ExceptionHandler()
  }

  /**
   * Returns the HTTP server instance.
   */
  getServer () {
    return this.server
  }

  fromAppRoot (appRoot) {
    this.appRoot = appRoot

    return this
  }

  /**
   * Initialize the HTTP server to run
   * your application.
   */
  async httpWithFullSpeed () {
    this.exceptionHandler.listenForSystemErrors()

    await this.prepareHttpServer()
    await this.startServer()
  }

  async prepareHttpServer () {
    if (!this.appRoot) {
      throw new Error('Cannot start HTTP server without app root directory. Ensure to call .appRoot() inside the server.js file.')
    }

    Helper.setAppRoot(this.appRoot)
    this.loadEnvironmentVariables()
    await this.loadApplicationConfig()
    await this.initializeEvents()
    await this.bootstrapHttpServer()
  }

  loadEnvironmentVariables () {
    Env.loadEnvironmentVariables()
  }

  async loadApplicationConfig () {
    await Config.loadConfigFiles(Path.resolve(Helper.appRoot(), 'config'))
  }

  /**
   * Start the HTTP server.
   */
  async startServer () {
    try {
      await this.server.start()
    } catch (err) {
      this.server = null
      console.error(err)
      process.exit(1)
    }
  }

  /**
   * Initialize the HTTP server instance and
   * register core plugins, middleware, app
   * plugins and configure views.
   */
  async bootstrapHttpServer () {
    this.ensureAppKey()

    const kernel = new HttpKernel(this)
    this.server = await kernel.bootstrap()
  }

  ensureAppKey () {
    if (!Config.get('app.key')) {
      throw new Error(
        'No application key available. Make sure to define the APP_KEY value in your .env file (or generate one with "node craft key:generate")'
      )
    }
  }

  /**
   * Register all application events and
   * assign listeners.
   */
  async initializeEvents () {
    await Dispatcher.init()
  }

  async consoleForLife () {
    this.exceptionHandler.listenForSystemErrors()

    if (!this.appRoot) {
      throw new Error('Cannot start Craft console without app root directory. Ensure to call .appRoot() inside the "craft" file.')
    }

    Helper.setAppRoot(this.appRoot)
    this.loadEnvironmentVariables()
    await this.loadApplicationConfig()
    await this.bootstrapConsole()
  }

  async bootstrapConsole () {
    const kernel = new ConsoleKernel()
    await kernel.bootstrap()
  }

  isRunningTests () {
    return Env.get('NODE_ENV') === 'testing'
  }
}

module.exports = Application
