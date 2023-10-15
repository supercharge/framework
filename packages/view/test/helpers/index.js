
const Path = require('path')
const { Application } = require('@supercharge/application')
const { ViewServiceProvider } = require('../../dist')

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

  app.register(new ViewServiceProvider(app))

  return app
}
