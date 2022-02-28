'use strict'

const { Application } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
exports.makeApp = function makeApp () {
  return Application.createWithAppRoot(__dirname)
}

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
exports.makeAppWithMongodbConfig = function makeAppWithMongodbConfig () {
  const app = exports.makeApp()

  app.config().set('mongodb', {
    default: 'local',
    connections: {
      local: {
        url: 'mongodb://localhost'
      }
    }
  })

  return app
}
