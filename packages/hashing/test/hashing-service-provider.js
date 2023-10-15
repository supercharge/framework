
const Path = require('path')
const { test } = require('uvu')
const { expect } = require('expect')
const { Application } = require('@supercharge/application')
const { HashManager, HashingServiceProvider } = require('../dist')

const app = Application.createWithAppRoot(
  Path.resolve(__dirname, 'fixtures')
)

test('register hash manager', async () => {
  app.register(new HashingServiceProvider(app))

  expect(app.make('hash')).toBeInstanceOf(HashManager)
})

test.run()
