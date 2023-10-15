
const Path = require('path')
const { HashingServiceProvider } = require('../../dist')
const { Application } = require('@supercharge/application')

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').HashConfig} [hashConfig]
 *
 * @returns {Promise<Application>}
 */
exports.setupApp = async function makeApp (hashConfig = {}) {
  const app = Application.createWithAppRoot(
    Path.resolve(__dirname)
  )

  app.config()
    .set('app.key', 'app-key-1234')
    .set('hashing', {
      driver: 'bcrypt',
      bcrypt: {
        rounds: 10,
        ...hashConfig.bcrypt
      },
      ...hashConfig
    })

  await app
    .register(new HashingServiceProvider(app))
    .boot()

  return app
}
