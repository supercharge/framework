'use strict'

const Hapi = require('hapi')
const Boom = require('boom')
const Config = require('./../../config')

class Server {
  constructor () {
    this.server = null
  }

  async bootstrap () {
    this.createServer()

    await this.warmUpCore()
    await this.configureViews()
    await this.loadMiddleware()
    await this.loadAppPlugins()
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
   * Register the Boost core dependencies.
   */
  async warmUpCore (options) {
    const loadCore = require('./load-server-core')
    const core = await loadCore(options)
    await this.server.register(core)
  }

  /**
   * Configure the Boost view engine.
   */
  configureViews () {
    const config = require('./initialize-view-handler')
    this.server.views(config.load())
  }

  /**
   * Register all middleware.
   *
   * @param {Object} options
   */
  async loadMiddleware (options) {
    const loadMiddleware = require('./load-middleware')
    const middleware = await loadMiddleware(options)
    await this.server.register(middleware)
  }

  /**
   * Register all application plugins.
   */
  async loadAppPlugins () {
    const loadAppPlugins = require('./load-app-plugins')
    const plugins = await loadAppPlugins()
    await this.server.register(plugins)
  }
}

module.exports = Server
