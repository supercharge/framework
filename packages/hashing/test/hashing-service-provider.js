
import { test } from 'uvu'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'
import { HashManager, HashingServiceProvider } from '../dist/index.js'

const app = Application.createWithAppRoot(
  fileURLToPath(import.meta.resolve('./fixtures'))
)

test('register hash manager', async () => {
  app.register(new HashingServiceProvider(app))

  expect(app.make('hash')).toBeInstanceOf(HashManager)
})

test.run()
