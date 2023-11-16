
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { HttpKernel, Application, ErrorHandler, RouteServiceProvider as BaseRouteServiceProvider } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRootPath = Path.resolve(__dirname, './fixtures')

class RouteServiceProvider extends BaseRouteServiceProvider {
  /**
   * Boot the service provider.
   */
  async boot () {
    this.loadRoutesFrom(
      this.app().resolveGlobFromBasePath('routes/web.**')
    )
  }
}

let app = createApp()

function createApp () {
  const app = Application
    .createWithAppRoot(appRootPath)
    .withErrorHandler(ErrorHandler)
    .bind('view', () => {
      // empty view mock
    })

  app.register(
    new RouteServiceProvider(app)
  )

  app.config().set('app.key', 1234)
  app.config().set('http', {
    host: 'localhost',
    port: 1234,
    cookie: {}
  })

  return app
}

test.before.each(() => {
  app = createApp()
})

test('boot route service provider', async () => {
  const kernel = new HttpKernel(app)
  await kernel.prepare()
  expect(globalThis.valueSetByRouteServiceProvider).toEqual('Supercharge')
})

test.run()
