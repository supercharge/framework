'use strict'

const Path = require('path')
const { SessionServiceProvider } = require('../../dist')
const { HttpServiceProvider } = require('@supercharge/http')
const { Application, ErrorHandler } = require('@supercharge/core')

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').SessionConfig} [sessionConfig]
 *
 * @returns {Promise<Application>}
 */
exports.setupApp = async function makeApp (sessionConfig = {}) {
  const app = Application
    .createWithAppRoot(Path.resolve(__dirname, '../fixtures'))
    .withErrorHandler(ErrorHandler)

  app.bind('view', () => viewMock)

  app.config()
    .set('app.key', 'app-key-1234')
    .set('session', {
      driver: 'cookie',
      name: 'supercharge-test-session',
      lifetime: 60,
      ...sessionConfig
    })

  await app
    .register(new HttpServiceProvider(app))
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
