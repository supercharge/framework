'use strict'

const Hapi = require('hapi')
const Boom = require('boom')
const Path = require('path')
const Config = require('./../../config')
const { forEachSeries } = require('p-iteration')

class HttpKernel {
  constructor (app) {
    this.app = app
    this.server = null

    this.bootstrappers = [
      'bootstrap/load-core-plugins.js',
      'bootstrap/load-user-plugins.js',
      'bootstrap/graceful-shutdown.js',
      'bootstrap/connect-database.js',
      'bootstrap/handle-views.js',
      'bootstrap/serve-assets.js',
      'bootstrap/load-middleware.js',
      'bootstrap/load-auth-strategies.js',
      'bootstrap/set-default-auth-strategy.js',
      'bootstrap/load-routes.js',
      'bootstrap/csrf-protection.js'
    ]
  }

  async bootstrap () {
    this.server = this.createServer()

    await this.registerBootstrappers()
    await this.server.initialize()

    return this.server
  }

  /**
   * Create a new hapi server instance.
   */
  createServer () {
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
          failAction: this.failAction
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
      await this.resolve(bootstrapper).extends(this.server)
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
  resolve (bootstrapper) {
    const Bootstrapper = require(Path.resolve(__dirname, bootstrapper))

    return new Bootstrapper(this.app)
  }
}

module.exports = HttpKernel
