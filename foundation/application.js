'use strict'

const Path = require('path')
const Env = require('../env')
const Fs = require('../filesystem')
const Config = require('../config')
const Helper = require('../helper')
const Logger = require('../logging')
const ConsoleKernel = require('../console/kernel')
const Collect = require('@supercharge/collections')
const EnvBootstrapper = require('../env/bootstrapper')
const AuthBootstrapper = require('../auth/bootstrapper')
const HttpBootstrapper = require('../http/bootstrapper')
const ViewBootstrapper = require('../view/bootstrapper')
const EventBootstrapper = require('../event/bootstrapper')
const ConfigBootstrapper = require('../config/bootstrapper')
const LoggingBootstrapper = require('../logging/bootstrapper')
const DatabaseBootstrapper = require('../database/bootstrapper')
const RoutingBootstrapper = require('../http/routing-bootstrapper')

class Application {
  constructor () {
    this.httpKernel = null
    this.consoleKernel = null
    this.bootstrapperFile = 'bootstrap/app.js'
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

  /**
   * Prepare the HTTP and console kernels, load the core and
   * userland bootstrappers to compose the application.
   */
  async initialize () {
    await this.registerCoreBootstrappers()
    await this.ensureAppRoot()
    await this.ensureAppKey()

    await this.registerAppBootstrappers()
    await this.registerUserlandBootstrappers()

    await this.initializeConsole()
  }

  async ensureAppRoot () {
    if (!Helper.appRoot()) {
      throw new Error('Missing app root directory. Make sure to call .fromAppRoot() when starting your app.')
    }
  }

  async ensureAppKey () {
    if (!Config.hasAppKey()) {
      throw new Error(
        'No application key available. Make sure to define the APP_KEY value in your .env file (or generate one with "node craft key:generate")'
      )
    }
  }

  /**
   * Initialize the console kernel instance,
   * load and register all core commands.
   */
  async initializeConsole () {
    this.consoleKernel = new ConsoleKernel(this)
    await this.consoleKernel.bootstrap()
  }

  /**
   * Initialize and bootstrap the application
   * and start the HTTP server.
   */
  async httpWithFullSpeed () {
    await this.initialize()
    await this.startServer()
  }

  /**
   * Start the HTTP server.
   */
  async startServer () {
    await this.httpKernel.start()
  }

  /**
   * Start the console application.
   */
  async consoleForLife () {
    await this.initialize()
    await this.consoleKernel.invoke()
  }

  isRunningTests () {
    return Env.isTesting()
  }

  /**
   * Load and run the core bootstrappers.
   */
  async registerCoreBootstrappers () {
    await this.register(EnvBootstrapper)
    await this.register(ConfigBootstrapper)
    await this.register(EventBootstrapper)
    await this.register(LoggingBootstrapper)
  }

  /**
   * Load and run the app bootstrappers bringing features
   * like the HTTP server, authentication, views,
   * and more to the application.
   */
  async registerAppBootstrappers () {
    await this.register(HttpBootstrapper)
    await this.register(AuthBootstrapper)
    await this.register(ViewBootstrapper)
    await this.register(DatabaseBootstrapper)
    await this.register(RoutingBootstrapper)

    // session bootstrapper can be extended and is therefore loaded from userland
  }

  /**
   * Load and run the user-land bootstrappers.
   */
  async registerUserlandBootstrappers () {
    await Collect(
      await this.loadUserlandBootstrappers()
    ).forEachSeries(async bootstrapper => {
      await this.register(bootstrapper)
    })
  }

  /**
   * Load the user-land bootstrappers listed in the
   * `bootstrap/app.js` file
   *
   * @returns {Array}
   */
  async loadUserlandBootstrappers () {
    if (await this.hasBootstrapFile()) {
      return this.loadBootstrappers()
    }

    Logger.debug('Missing bootstrap/app.js file. Skipping bootstrappers while app start.')

    return []
  }

  /**
   * Determines whether the `bootstrap/app.js` file exists.L0
   *
   * @returns {Boolean}
   */
  async hasBootstrapFile () {
    return Fs.exists(this.bootstrapFile())
  }

  /**
   * Returns the path to the `bootstrap/app.js` file.
   *
   * @returns {String}
   */
  bootstrapFile () {
    return Path.resolve(Helper.appRoot(), this.bootstrapperFile)
  }

  /**
   * Resolve the bootstrappers array.
   *
   * @returns {Boolean}
   */
  async loadBootstrappers () {
    const { bootstrappers } = require(this.bootstrapFile())

    if (!Array.isArray(bootstrappers)) {
      Logger.error(`The "bootstrappers" property in bootstrap/app.js must be an array, received ${typeof bootstrappers}. Ignoring the file.`)

      return []
    }

    return bootstrappers
  }

  /**
   * Register a single bootstrapper.
   */
  async register (Bootstrapper) {
    await new Bootstrapper(this).boot()
  }
}

module.exports = Application
