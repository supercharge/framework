'use strict'

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
    this._middlewareFolder = 'app/middleware'
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
      const { type, method, options } = this.resolve(file)
      server.ext({ type, method, options })
    })
  }

  middlewareFolder () {
    return Path.resolve(Helper.appRoot(), this._middlewareFolder)
  }

  async loadMiddlewareFiles () {
    return ReadRecursive(this.middlewareFolder())
  }

  resolve (file) {
    return require(Path.resolve(this.middlewareFolder(), file))
  }
}

module.exports = LoadMiddleware
