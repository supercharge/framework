'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const ReadRecursive = require('recursive-readdir')

/**
 * Load middlewares that apply to all
 * or a group of requests.
 */
class LoadMiddleware {
  constructor () {
    this._files = null
    this._middlewareFolder = 'app/middleware'
    this._allowedMethods = [
      'onRequest', 'onPreAuth', 'onCredentials', 'onPostAuth', 'onPreHandler', 'onPostHandler',
      'onPreResponse', 'onPreStart', 'onPreStop', 'onPreStop', 'onPostStop'
    ]
  }

  async extends (server) {
    if (await this.hasMiddleware()) {
      return this.loadMiddleware(server)
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

  async hasMiddlewareFiles () {
    return Object.keys(await this.loadMiddlewareFiles()).length > 0
  }

  async loadMiddleware (server) {
    const files = await this.loadMiddlewareFiles()

    files.forEach(file => {
      const middleware = this.resolve(file)

      typeof middleware === 'object'
        ? this.loadFromObject(server, middleware)
        : this.loadFromClass(server, middleware)
    })
  }

  middlewareFolder () {
    return Path.resolve(Helper.appRoot(), this._middlewareFolder)
  }

  async loadMiddlewareFiles () {
    if (!this._files) {
      this._files = await ReadRecursive(this.middlewareFolder())
    }

    return this._files
  }

  resolve (file) {
    return require(file)
  }

  loadFromObject (server, middleware) {
    const { type, method, options } = middleware
    server.ext({ type, method, options })
  }

  loadFromClass (server, Middleware) {
    const middleware = new Middleware(server)

    if (!this.isMiddleware(middleware)) {
      throw new Error(`Your middleware ${middleware.constructor.name} does not include a required method.
        Implement at least one of the following methods:
        -> ${this._allowedMethods}.
      `)
    }

    this.implementedMiddlewareMethods(middleware).forEach(method => {
      server.ext(method, middleware[method])
    })
  }

  isMiddleware (middleware) {
    return !_.isEmpty(this.implementedMiddlewareMethods(middleware))
  }

  implementedMiddlewareMethods (middleware) {
    return _.intersection(
      this._allowedMethods,
      this.classMethods(middleware)
    )
  }

  classMethods (middleware) {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(middleware))
  }
}

module.exports = LoadMiddleware
