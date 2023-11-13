
import Path from 'node:path'
import { fileURLToPath } from 'node:url'
import ErrorHandler from './error-handler.js'
import { Application } from '@supercharge/core'
import { SessionServiceProvider } from '../../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRootPath = Path.resolve(__dirname, './fixtures')

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').SessionConfig} sessionConfig
 *
 * @returns {Promise<Application>}
 */
export async function setupApp (sessionConfig = {}) {
  const app = Application
    .createWithAppRoot(appRootPath)
    .withErrorHandler(ErrorHandler)
    .bind('view', () => viewMock)

  app.config()
    .set('app.key', 'app-key-1234')
    .set('bodyparser', {
      methods: ['POST']
    })
    .set('http', {
      host: 'localhost',
      port: 1234
    })
    .set('session', {
      driver: 'cookie',
      name: 'supercharge-test-session',
      lifetime: 60,
      ...sessionConfig
    })

  await app
    .register(new SessionServiceProvider(app))
    .boot()

  return app
}

const viewMock = {
  render () {
    return '<h1>error-view</h1>'
  },
  exists (view) {
    return view === 'errors/401'
  }
}
