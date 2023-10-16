
import { Application } from '@supercharge/application'
import { ViewServiceProvider } from '../../dist/index.js'

/**
 * Returns a test application.
 *
 * @returns {Application}
 */
export function makeApp () {
  const appRoot = import.meta.resolve('./../fixtures')

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
