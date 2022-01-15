'use strict'

const Path = require('path')
const { Application } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
exports.makeApp = function makeApp () {
  const app = Application.createWithAppRoot(
    Path.resolve(__dirname, '../fixtures')
  )

  app.config().set('view', {
    driver: 'handlebars',
    handlebars: {
      views: app.resourcePath('views'),
      partials: app.resourcePath('views/partials'),
      helpers: app.resourcePath('views/helpers'),
      layouts: app.resourcePath('views/layouts')
      // defaultLayout: 'app'
    }
  })

  return app
}
