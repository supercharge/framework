'use strict'

const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')
const GracefulShutdowns = require('./06-graceful-shutdowns')

class RegistersMiddleware extends GracefulShutdowns {
  constructor () {
    super()

    this._middlewareFiles = null
    this._middlewareFolder = 'app/middleware'
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
      this._middlewareFiles = await ReadRecursive(this.middlewareFolder(), [
        file => this.shouldIgnore(file)
      ])
    }

    return this._middlewareFiles
  }

  async loadMiddleware () {
    await Collect(
      await this.loadMiddlewareFiles()
    ).forEach(file => {
      this._registerMiddleware(this.resolveMiddleware(file))
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
    this.server.extClass(Middleware)
  }
}

module.exports = RegistersMiddleware
