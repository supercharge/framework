'use strict'

const Hapi = require('hapi')
const Boom = require('boom')
const Path = require('path')
const Many = require('extends-classes')
const Config = require('./../../config')
const { forEachSeries } = require('p-iteration')
const RegistersRoutes = require('./traits/registers-routes')
const GracefulShutdowns = require('./traits/graceful-shutdowns')
const RegistersMiddleware = require('./traits/registers-middleware')
const RegistersAppPlugins = require('./traits/registers-app-plugins')
const RegistersCorePlugins = require('./traits/registers-core-plugins')

class HttpKernel extends Many(RegistersRoutes, RegistersCorePlugins, RegistersAppPlugins, RegistersMiddleware, GracefulShutdowns) {
  constructor (app) {
    super()

    this.app = app
    this.server = null

    this.bootstrappers = [
      '../../auth/bootstrapper.js',
      '../../database/bootstrapper.js',
      '../../view/bootstrapper.js'
    ]
  }

  async bootstrap () {
    await this.createServer()
    await this.registerBootstrappers()

    await this._loadAppPlugins()
    await this._loadAppRoutes()
    await this._loadAppMiddleware()
    await this._registerShutdownHandler()

    await this.server.initialize()
  }

  /**
   * Create a new hapi server instance.
   */
  async createServer () {
    this.server = new Hapi.Server({
      host: 'localhost',
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
          failAction: this.failAction
        }
      }
    })

    await this._loadCorePlugins()
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
  failAction (_, __, error) {
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
  async registerBootstrappers () {
    await forEachSeries(this.bootstrappers, async bootstrapper => {
      await this.resolveBootstrapper(bootstrapper).boot()
    })
  }

  /**
   * Resolve the bootstrapper, instantiate
   * a bootstrapper class and pass the
   * app argument to it.
   *
   * @param {String} bootstrapper
   *
   * @returns {Class}
   */
  resolveBootstrapper (bootstrapper) {
    const Bootstrapper = require(Path.resolve(__dirname, bootstrapper))

    return new Bootstrapper(this.app)
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

  registerMiddleware (middleware) {
    this._registerMiddleware(middleware)
  }
}

module.exports = HttpKernel
