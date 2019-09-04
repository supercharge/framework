'use strict'

const Hapi = require('@hapi/hapi')
const Boom = require('@hapi/boom')
const Config = require('../config')
const HttpConcerns = require('./concerns')

class HttpKernel extends HttpConcerns {
  constructor (app) {
    super()

    this.app = app
    this.server = this._createServer()
  }

  getServer () {
    return this.server
  }

  async bootstrap () {
    await this._registerCorePlugins()
    await this._loadAppPlugins()
    await this._loadAndRegisterRoutes()
    await this._loadAppMiddleware()
    await this._registerShutdownHandler()
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
