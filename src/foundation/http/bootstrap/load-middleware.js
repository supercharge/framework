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
    this._files = null
    this._middlewareFolder = 'app/middleware'
  }

  async extends (httpKernel) {
    if (await this.hasMiddleware()) {
      return this.loadMiddleware(httpKernel)
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
    if (!this._files) {
      this._files = await ReadRecursive(this.middlewareFolder())
    }

    return this._files
  }

  async loadMiddleware (httpKernel) {
    const files = await this.loadMiddlewareFiles()

    files.forEach(file => {
      httpKernel.registerMiddleware(this.resolve(file))
    })
  }

  resolve (file) {
    return require(file)
  }
}

module.exports = LoadMiddleware
