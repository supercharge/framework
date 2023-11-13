
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { Str } from '@supercharge/strings'
import { Application } from '@supercharge/application'
import { Encrypter, EncryptionServiceProvider } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = Path.resolve(__dirname, './fixtures')

const app = Application.createWithAppRoot(fixturesPath)

app.config().set('app.key', Str.random(32))

test('register encrypter and aliases', async () => {
  app.register(new EncryptionServiceProvider(app))

  expect(app.make('encrypter')).toBeInstanceOf(Encrypter)
  expect(app.make('encryption')).toBeInstanceOf(Encrypter)
})

test.run()
