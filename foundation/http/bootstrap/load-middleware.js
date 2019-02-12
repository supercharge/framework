'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const { forEachSeries } = require('p-iteration')
const ReadRecursive = require('recursive-readdir')

/**
 * Load middlewares that apply to all
 * or a group of requests.
 */
class LoadMiddleware {
  constructor () {
    this._middlewareFolder = 'app/http/middleware'
  }

  async extends (server) {
    if (await this.hasMiddleware()) {
      return this.loadMiddlware(server)
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

  async loadMiddlware (server) {
    const files = await this.loadMiddlewareFiles()

    await forEachSeries(files, async file => {
      await server.register(this.resolve(file))
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
