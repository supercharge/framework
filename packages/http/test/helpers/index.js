
const Path = require('path')
const deepmerge = require('deepmerge')
const ErrorHandler = require('./error-handler')
const { HttpServiceProvider } = require('../../dist')
const { Application } = require('@supercharge/application')
const { ViewServiceProvider } = require('@supercharge/view')

const defaultOptions = {
  appRoot: Path.resolve(__dirname)
}

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').HttpConfig} [httpConfig]
 *
 * @returns {Application}
 */
exports.setupApp = function makeApp (config) {
  config = deepmerge(defaultOptions, { ...config })

  const app = Application
    .createWithAppRoot(config.appRoot)
    .withErrorHandler(ErrorHandler)

  app.config()
    .set('app', deepmerge({
      key: 'app-key-1234'
    }, { ...config.app }))
    .set('http', deepmerge({
      host: 'localhost',
      port: 7337,
      cookie: {}
    }, { ...config.http }))
    .set('view', deepmerge({
      driver: 'handlebars',
      handlebars: {
        views: app.resourcePath('views'),
        partials: app.resourcePath('views/partials'),
        helpers: app.resourcePath('views/helpers')
        // layouts: app.resourcePath('views/layouts')
        // defaultLayout: 'app'
      }
    }, { ...config.view }))
    .set('cors', deepmerge({}, { ...config.cors }))
    .set('static', deepmerge({}, { ...config.static }))
    .set('bodyparser', deepmerge({}, { ...config.bodyparser }))

  return app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
}
