'use strict'

const Path = require('path')
const { expect } = require('expect')
const { test } = require('@japa/runner')
const { Application } = require('@supercharge/application')
const { HashManager, HashingServiceProvider } = require('../dist')

const app = Application.createWithAppRoot(
  Path.resolve(__dirname, 'fixtures')
)

test.group('Hashing Service Provider', () => {
  test('register hash manager', async () => {
    app.register(new HashingServiceProvider(app))

    expect(app.make('hash')).toBeInstanceOf(HashManager)
  })
})
