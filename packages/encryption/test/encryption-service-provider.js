
const Path = require('path')
const { expect } = require('expect')
const { test } = require('@japa/runner')
const { Str } = require('@supercharge/strings')
const { Application } = require('@supercharge/application')
const { Encrypter, EncryptionServiceProvider } = require('../dist')

const app = Application.createWithAppRoot(
  Path.resolve(__dirname, 'fixtures')
)

app.config().set('app.key', Str.random(32))

test.group('Encryption Service Provider', () => {
  test('register encrypter and aliases', async () => {
    app.register(new EncryptionServiceProvider(app))

    expect(app.make('encrypter')).toBeInstanceOf(Encrypter)
    expect(app.make('encryption')).toBeInstanceOf(Encrypter)
  })
})
