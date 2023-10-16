
import { expect } from 'expect'
import { test } from 'node:test'
import { Str } from '@supercharge/strings'
import { Application } from '@supercharge/application'
import { Encrypter, EncryptionServiceProvider } from '../dist/index.js'

const app = Application.createWithAppRoot(
  import.meta.resolve('./fixtures')
)

app.config().set('app.key', Str.random(32))

test('register encrypter and aliases', async () => {
  app.register(new EncryptionServiceProvider(app))

  expect(app.make('encrypter')).toBeInstanceOf(Encrypter)
  expect(app.make('encryption')).toBeInstanceOf(Encrypter)
})
