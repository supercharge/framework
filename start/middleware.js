'use strict'

const Path = require('path')
const Fs = require('@root/filesystem')

/**
 * Load middlewares that apply to all
 * or a group of requests.
 */
async function loadMiddleware ({ exclude, appRoot } = {}) {
  const middlewarePath = Path.resolve(appRoot, 'app', 'http', 'middleware')

  const middleware = await Fs.readDir(middlewarePath)
  const excludes = Array.isArray(exclude) ? exclude : [exclude]

  return middleware
    .filter(middleware => {
      return !excludes.includes(middleware)
    })
    .map(middleware => {
      return {
        plugin: require(Path.resolve(middlewarePath, middleware))
      }
    })
}

module.exports = loadMiddleware
