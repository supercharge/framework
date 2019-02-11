'use strict'

const Hapi = require('hapi')
const Boom = require('boom')
const Path = require('path')
const Config = require('./../../config')
const { forEachSeries } = require('p-iteration')

class HttpKernel {
  constructor () {
    this.server = null

    this.bootstrappers = [
      'bootstrap/load-core-plugins.js',
      'bootstrap/graceful-shutdown.js',
      'bootstrap/connect-database.js',
      'bootstrap/handle-views.js',
      'bootstrap/serve-assets.js',
      'bootstrap/load-middleware.js',
      'bootstrap/extend-app-from-userland.js',
      'bootstrap/set-default-auth-strategy.js',
      'bootstrap/load-routes.js'
    ]
  }

  async bootstrap () {
    this.createServer()

    await this.registerBootstrappers()
    await this.server.initialize()

    return this.server
  }

  /**
   * Create a new hapi server instance.
   */
  createServer () {
    this.server = new Hapi.Server({
      host: 'localhost',
      port: Config.get('app.port'),
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

  resolve (bootstrapper) {
    const Bootstrapper = require(Path.resolve(__dirname, bootstrapper))

    return new Bootstrapper()
  }
}

module.exports = HttpKernel
