'use strict'

const Path = require('path')
const { Application } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @returns {Promise<Application>}
 */
exports.setupApp = async function makeApp (sessionConfig = {}) {
  const app = Application.createWithAppRoot(
    Path.resolve(__dirname, '../fixtures')
  )

  app.config().set('session', {
    driver: 'memory',
    // ...
    ...sessionConfig
  })

  // await app

  return app
}
