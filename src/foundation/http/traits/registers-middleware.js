'use strict'

const _ = require('lodash')

class RegistersMiddleware {
  constructor () {
    this._allowedMethods = [
      'onRequest',
      'onPreAuth',
      'onCredentials',
      'onPostAuth',
      'onPreHandler',
      'onPostHandler',
      'onPreResponse',
      'onPreStart',
      'onPreStop',
      'onPreStop',
      'onPostStop'
    ]
  }

  registerMiddleware (middleware) {
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
    const middleware = new Middleware(this.server)

    if (!this._isMiddleware(middleware)) {
      throw new Error(`Your middleware ${middleware.constructor.name} does not include a required method.
        Implement at least one of the following methods:
        -> ${this._allowedMethods}.
      `)
    }

    this._implementedMiddlewareMethods(middleware).forEach(method => {
      this.server.ext(method, middleware[method])
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
