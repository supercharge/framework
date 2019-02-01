'use strict'

const Path = require('path')
const Fs = require('./../../filesystem')
const Helper = require('./../../helper')

/**
 * Load middlewares that apply to all
 * or a group of requests.
 */
async function loadMiddleware ({ exclude } = {}) {
  const middlewarePath = Path.resolve(Helper.appRoot(), 'app', 'http', 'middleware')

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
