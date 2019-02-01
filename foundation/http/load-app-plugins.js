'use strict'

const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')
const pluginPath = Path.resolve(Helper.appRoot(), 'app', 'http', 'web')

/**
 * Register your hapi application plugins here.
 */
async function loadAppPlugins () {
  const plugins = await Fs.readDir(pluginPath)

  return plugins.map(plugin => {
    return {
      plugin: require(Path.resolve(pluginPath, plugin))
    }
  })
}

module.exports = loadAppPlugins
