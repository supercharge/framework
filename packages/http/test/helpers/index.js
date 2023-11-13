
import Path from 'node:path'
import deepmerge from 'deepmerge'
import { fileURLToPath } from 'node:url'
import ErrorHandler from './error-handler.js'
import { Application } from '@supercharge/application'
import { ViewServiceProvider } from '@supercharge/view'
import { HttpServiceProvider } from '../../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRoot = Path.resolve(__dirname, './')

const defaultOptions = {
  appRoot
}

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').HttpConfig} [httpConfig]
 *
 * @returns {Application}
 */
export function setupApp (config) {
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
