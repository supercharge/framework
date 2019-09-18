'use strict'

const Path = require('path')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Collect = require('@supercharge/collections')

class HttpBoostrapper {
  constructor (app) {
    this.app = app

    this._pluginFiles = null
    this._pluginsFolder = 'app/plugins'

    this._middlewareFiles = null
    this._middlewareFolder = 'app/middleware'

    this._lifecycleFile = 'bootstrap/lifecycle.js'
  }

  /**
   * Bootstrap authentication by loading the schemes,
   * strategies and applying the default app's
   * authentication strategy.
   */
  async boot () {
    await this.registerCorePlugins()
    await this.loadAndRegisterAppPlugins()
    await this.loadAppMiddleware()
    await this.registerShutdownHandler()
  }

  async registerCorePlugins () {
    await this.app.server.register([
      { plugin: require('@hapi/vision') },
      { plugin: require('hapi-request-utilities') },
      { plugin: require('hapi-response-utilities') },
      { plugin: require('hapi-class-extension-points') }
    ])

    if (!this.app.isRunningTests()) {
      await this.app.server.register({
        plugin: require('laabr'),
        options: {
          formats: { log: 'log.tiny' },
          colored: true,
          hapiPino: { logPayload: false }
        }
      })
    }
  }

  async loadAndRegisterAppPlugins () {
    if (await this.hasPlugins()) {
      return this.registerPluginsToServer()
    }
  }

  async hasPlugins () {
    return await this.pluginsFolderExists()
      ? this.hasPluginFiles()
      : false
  }

  async pluginsFolderExists () {
    return Fs.exists(this.pluginsFolder())
  }

  async hasPluginFiles () {
    return Collect(
      await this.pluginFiles()
    ).isNotEmpty()
  }

  async registerPluginsToServer () {
    await Collect(
      await this.pluginFiles()
    ).forEachSeries(async plugin => {
      await this.app.server.register(this.resolveAppPlugin(plugin))
    })
  }

  pluginsFolder () {
    return Path.resolve(Helper.appRoot(), this._pluginsFolder)
  }

  async pluginFiles () {
    if (!this._pluginFiles) {
      this._pluginFiles = await Fs.allFiles(this.pluginsFolder())
    }

    return this._pluginFiles
  }

  resolveAppPlugin (file) {
    return require(Path.resolve(this.pluginsFolder(), file))
  }

  async loadAppMiddleware () {
    if (await this.hasMiddleware()) {
      return this.loadMiddleware()
    }
  }

  async hasMiddleware () {
    return await this.middlewareFolderExists()
      ? this.hasMiddlewareFiles()
      : false
  }

  async middlewareFolderExists () {
    return Fs.exists(this.middlewareFolder())
  }

  middlewareFolder () {
    return Path.resolve(Helper.appRoot(), this._middlewareFolder)
  }

  async hasMiddlewareFiles () {
    return Object.keys(await this.loadMiddlewareFiles()).length > 0
  }

  async loadMiddlewareFiles () {
    if (!this._middlewareFiles) {
      this._middlewareFiles = await Fs.allFiles(this.middlewareFolder(), {
        ignore: file => this.shouldIgnore(file)
      })
    }

    return this._middlewareFiles
  }

  async loadMiddleware () {
    await Collect(
      await this.loadMiddlewareFiles()
    ).forEach(file => {
      this.registerMiddleware(this.resolve(file))
    })
  }

  resolve (file) {
    return require(file)
  }

  registerMiddleware (middleware) {
    if (typeof middleware === 'object') {
      return this.loadFromObject(middleware)
    }

    if (typeof middleware === 'function') {
      return this.loadFromClass(middleware)
    }

    throw new Error(`Cannot load middleware ${middleware}. Only objects and classes are supported.`)
  }

  loadFromObject (middleware) {
    const { type, method, options } = middleware
    this.app.server.ext({ type, method, options })
  }

  loadFromClass (Middleware) {
    this.app.server.extClass(Middleware)
  }

  shouldIgnore (file) {
    return Path.basename(file).startsWith('_')
  }

  /**
   * Registers a plugin to gracefully shut down the HTTP server.
   * This will also load and assign custom `preServerStop`,
   * `postServerStop`, `preShutdown` methods.
   */
  async registerShutdownHandler () {
    const { preServerStop, postServerStop, preShutdown } = await this.lifecycleMethods()

    this.app.server.register({
      plugin: require('hapi-pulse'),
      options: {
        preServerStop,
        postServerStop,
        preShutdown
      }
    })
  }

  /**
   * Loads the lifecycle file contents and returns
   * the object containing the pre/post server
   * stop and pre shutdown handling.
   *
   * @returns {Object}
   */
  async lifecycleMethods () {
    return await Fs.exists(this.lifecycleFile())
      ? require(this.lifecycleFile())
      : {}
  }

  /**
   * Resolves the path to the lifecycle file starting
   * at app root. The file is typically located
   * in `bootstrap/lifecycle.js`.
   *
   * @returns {String}
   */
  lifecycleFile () {
    return Path.resolve(Helper.appRoot(), this._lifecycleFile)
  }
}

module.exports = HttpBoostrapper
