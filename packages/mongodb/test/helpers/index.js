'use strict'

const { Application } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
exports.makeApp = function makeApp () {
  const app = Application.createWithAppRoot(__dirname)

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
