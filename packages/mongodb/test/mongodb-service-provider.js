'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { makeAppWithMongodbConfig } = require('./helpers')
const { MongodbServiceProvider, MongodbManager } = require('../dist')

test.group('MongodbServiceProvider', () => {
  test('register mongodb service provider', async () => {
    const app = makeAppWithMongodbConfig()
    app.register(new MongodbServiceProvider(app))

    expect(app.make('mongodb') instanceof MongodbManager).toBe(true)
  })

  test('boot the registered mongodb service provider', async () => {
    const app = makeAppWithMongodbConfig()

    await app
      .register(new MongodbServiceProvider(app))
      .boot()

    const mongodb = app.make('mongodb')
    const connection = await mongodb.connection()

    expect(connection.isConnected()).toBe(true)
    await connection.disconnect()
  })
})
