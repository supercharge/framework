'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const Helper = require('../../../helper')
const { forEachSeries } = require('p-iteration')
const ReadRecursive = require('recursive-readdir')

class LoadUserPlugins {
  constructor () {
    this._pluginsFolder = 'app/plugins'
  }

  async extends (server) {
    if (await this.hasPlugins()) {
      return this.registerPluginsTo(server)
    }
  }

  async hasPlugins () {
    return await this.pluginsFolderExists()
      ? this.hasPluginFiles()
      : false
  }

  async pluginsFolderExists () {
    return Fs.exists(this.pluginsFolder())
  }

  async hasPluginFiles () {
    return Object.keys(await this.pluginFiles()).length > 0
  }

  async registerPluginsTo (server) {
    const files = await this.pluginFiles()

    await forEachSeries(files, async plugin => {
      await server.register(this.resolve(plugin))
    })
  }

  pluginsFolder () {
    return Path.resolve(Helper.appRoot(), this._pluginsFolder)
  }

  async pluginFiles () {
    return ReadRecursive(this.pluginsFolder())
  }

  resolve (file) {
    return require(Path.resolve(this.pluginsFolder(), file))
  }
}

module.exports = LoadUserPlugins
