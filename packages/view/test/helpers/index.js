
import Path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'
import { ViewServiceProvider } from '../../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRoot = Path.resolve(__dirname, './../fixtures')

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
export function makeApp () {
  const app = Application.createWithAppRoot(appRoot)

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
