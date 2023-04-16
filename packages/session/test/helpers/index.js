'use strict'

const Path = require('path')
const ErrorHandler = require('./error-handler')
const { Application } = require('@supercharge/core')
const { SessionServiceProvider } = require('../../dist')

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').SessionConfig} sessionConfig
 *
 * @returns {Promise<Application>}
 */
exports.setupApp = async function makeApp (sessionConfig = {}) {
  const app = Application
    .createWithAppRoot(Path.resolve(__dirname, '../fixtures'))
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
