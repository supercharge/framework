'use strict'

const Path = require('path')
const Helper = require('../../helper')
const Fs = require('../../filesystem')
const ReadRecursive = require('recursive-readdir')
const Collect = require('@supercharge/collections')
const RegistersRoutes = require('./03-registers-routes')

class RegistersAppPlugins extends RegistersRoutes {
  constructor () {
    super()

    this._pluginsFolder = 'app/plugins'
  }

  async _loadAppPlugins () {
    if (await this.hasPlugins()) {
      return this.registerPluginsToServer()
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
    return Collect(
      await this.pluginFiles()
    ).isNotEmpty()
  }

  async registerPluginsToServer () {
    await Collect(
      await this.pluginFiles()
    ).forEachSeries(async plugin => {
      await this.server.register(this.resolveAppPlugin(plugin))
    })
  }

  pluginsFolder () {
    return Path.resolve(Helper.appRoot(), this._pluginsFolder)
  }

  async pluginFiles () {
    return ReadRecursive(this.pluginsFolder())
  }

  resolveAppPlugin (file) {
    return require(Path.resolve(this.pluginsFolder(), file))
  }
}

module.exports = RegistersAppPlugins
