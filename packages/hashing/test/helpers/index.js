
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'
import { BcryptHasher } from '../../dist/bcrypt-hasher.js'
import { ScryptHasher } from '../../dist/scrypt-hasher.js'
import { HashingServiceProvider } from '../../dist/index.js'

/**
 * Returns a test application.
 *
 * @param {import('@supercharge/contracts').HashConfig} [hashConfig]
 *
 * @returns {Promise<Application>}
 */
export async function setupApp (hashConfig = {}) {
  const app = Application.createWithAppRoot(
    fileURLToPath(import.meta.resolve('./'))
  )

  app.config()
    .set('app.key', 'app-key-1234')
    .set('hashing', {
      driver: 'bcrypt',
      drivers: {
        bcrypt: BcryptHasher,
        scrypt: ScryptHasher
      },
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
