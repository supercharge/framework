
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { Application } from '@supercharge/application'
import { HashManager, HashingServiceProvider } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = Path.resolve(__dirname, './fixtures')

const app = Application.createWithAppRoot(fixturesPath)

test('register hash manager', async () => {
  app.register(new HashingServiceProvider(app))

  expect(app.make('hash')).toBeInstanceOf(HashManager)
})

test.run()
