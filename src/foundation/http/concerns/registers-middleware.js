'use strict'

const _ = require('lodash')
const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const ReadRecursive = require('recursive-readdir')

class RegistersMiddleware {
  constructor () {
    this._middlewareFiles = null
    this._middlewareFolder = 'app/middleware'

    this._allowedMethods = [
      'onPreStart',
      'onPreStop',
      'onRequest',
      'onPreAuth',
      'onCredentials',
      'onPostAuth',
      'onPreHandler',
      'onPostHandler',
      'onPreResponse',
      'onPreStop',
      'onPostStop'
    ]
  }

  async _loadAppMiddleware () {
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
      this._middlewareFiles = await ReadRecursive(this.middlewareFolder(), [ this.shouldIgnore ])
    }

    return this._middlewareFiles
  }

  shouldIgnore (file) {
    return _.startsWith(Path.basename(file), '_')
  }

  async loadMiddleware () {
    const files = await this.loadMiddlewareFiles()

    files.forEach(file => {
      this.registerMiddleware(this.resolveMiddleware(file))
    })
  }

  resolveMiddleware (file) {
    return require(file)
  }

  _registerMiddleware (middleware) {
    if (typeof middleware === 'object') {
      return this._loadFromObject(middleware)
    }

    if (typeof middleware === 'function') {
      return this._loadFromClass(middleware)
    }

    throw new Error(`Cannot load middleware ${middleware}. Only objects and classes are supported.`)
  }

  _loadFromObject (middleware) {
    const { type, method, options } = middleware
    this.server.ext({ type, method, options })
  }

  _loadFromClass (Middleware) {
    const middleware = new Middleware(this.app)

    if (!this._isMiddleware(middleware)) {
      throw new Error(`Your middleware ${middleware.constructor.name} does not include a required method.
        Implement at least one of the following methods:
        -> ${this._allowedMethods}.
      `)
    }

    this._implementedMiddlewareMethods(middleware).forEach(method => {
      this.server.ext(method, async (request, h) => middleware[method](request, h))
    })
  }

  _isMiddleware (middleware) {
    return !_.isEmpty(this._implementedMiddlewareMethods(middleware))
  }

  _implementedMiddlewareMethods (middleware) {
    return _.intersection(
      this._allowedMethods,
      this._classMethods(middleware)
    )
  }

  _classMethods (middleware) {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(middleware))
  }
}

module.exports = RegistersMiddleware
