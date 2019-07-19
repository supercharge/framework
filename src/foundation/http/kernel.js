'use strict'

const Hapi = require('hapi')
const Boom = require('boom')
const Path = require('path')
const Many = require('extends-classes')
const Config = require('./../../config')
const Collect = require('@supercharge/collections')
const RegistersRoutes = require('./concerns/registers-routes')
const GracefulShutdowns = require('./concerns/graceful-shutdowns')
const RegistersMiddleware = require('./concerns/registers-middleware')
const RegistersAppPlugins = require('./concerns/registers-app-plugins')
const RegistersCorePlugins = require('./concerns/registers-core-plugins')

class HttpKernel extends Many(RegistersRoutes, RegistersCorePlugins, RegistersAppPlugins, RegistersMiddleware, GracefulShutdowns) {
  constructor (app) {
    super()

    this.app = app
    this.server = this._createServer()
    this.bootstrappers = [
      '../../auth/bootstrapper.js',
      '../../database/bootstrapper.js',
      '../../view/bootstrapper.js'
    ]
  }

  async bootstrap () {
    await this._loadCorePlugins()
    await this._registerBootstrappers()
    await this._loadAppPlugins()

    await this._loadAppRoutes()
    await this._loadAppMiddleware()
    await this._registerShutdownHandler()

    await this.server.initialize()
  }

  /**
   * Create a new hapi server instance.
   */
  _createServer () {
    return new Hapi.Server({
      host: Config.get('app.host'),
      port: Config.get('app.port'),
      router: {
        stripTrailingSlash: true
      },
      routes: {
        validate: {
          options: {
            stripUnknown: true,
            abortEarly: false
          },
          failAction: this._failAction
        }
      }
    })
  }

  /**
   * The hapi server throws validation errors by default.
   * This makes the detailed error messages available.
   * The reducer composes an object with the errors.
   *
   * @param {Object} _ - request (not used)
   * @param {Object} __ - h (not used)
   * @param {Object} error
   *
   * @throws
   */
  _failAction (_, __, error) {
    const errors = error.details.reduce((collector, { path, message }) => {
      const field = path[path.length - 1]

      return {
        ...collector,
        [field]: message.replace(/"/g, '')
      }
    }, {})

    throw Boom.badRequest(error.message, errors)
  }

  /**
   * Register the core dependencies.
   */
  async _registerBootstrappers () {
    await Collect(this.bootstrappers).forEachSeries(async bootstrapper => {
      return this._startBootstrapper(bootstrapper)
    })
  }

  /**
   * Register a single bootstrapper.
   */
  async _startBootstrapper (bootstrapper) {
    let Bootstrapper = bootstrapper

    if (typeof bootstrapper === 'string') {
      Bootstrapper = this._resolveBootstrapperFromPath(bootstrapper)
    }

    return new Bootstrapper(this.server).boot()
  }

  /**
   * Resolve the bootstrapper, instantiate
   * a bootstrapper class and pass the
   * app argument to it.
   *
   * @param {String} path
   *
   * @returns {Class}
   */
  _resolveBootstrapperFromPath (path) {
    return require(
      Path.resolve(__dirname, path)
    )
  }

  getServer () {
    return this.server
  }

  async start () {
    try {
      await this.server.start()
    } catch (err) {
      this.server = null
      console.error(err)
      process.exit(1)
    }
  }
}

module.exports = HttpKernel
