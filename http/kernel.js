'use strict'

const Path = require('path')
const Hapi = require('@hapi/hapi')
const Boom = require('@hapi/boom')
const Config = require('../config')
const HttpConcerns = require('./concerns')
const Collect = require('@supercharge/collections')

class HttpKernel extends HttpConcerns {
  constructor (app) {
    super()

    this.app = app
    this.server = this._createServer()
    this.bootstrappers = [
      '../auth/bootstrapper.js',
      '../database/bootstrapper.js',
      '../view/bootstrapper.js'
    ]
  }

  async bootstrap () {
    await this._loadAndRegisterPlugins()
    await this._registerBootstrappers()
    await this._loadAppPlugins()

    await this._loadAndRegisterRoutes()
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
    await Collect(this.bootstrappers)
      .concat(
        await this._loadUserlandBootstrappers()
      )
      .forEachSeries(async bootstrapper => {
        return this._registerBootstrapper(bootstrapper)
      })
  }

  /**
   * Register a single bootstrapper.
   */
  async _registerBootstrapper (bootstrapper) {
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
