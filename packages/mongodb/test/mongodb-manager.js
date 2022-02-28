'use strict'

const { test } = require('@japa/runner')
const { MongodbManager } = require('../dist')
const { makeApp, makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()

test.group('MongoDB Manager', async () => {
  test('boot', async ({ expect }) => {
    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    await mongodb.boot()

    const connection = await mongodb.connection()

    expect(connection.isConnected()).toBe(true)
    await connection.disconnect()
  })

  test('isDisconnected', async ({ expect }) => {
    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    const connection = await mongodb.connection()

    // expect the connection to be established after retrieving it
    expect(connection.isConnected()).toBe(true)
    expect(connection.isDisconnected()).toBe(false)

    await connection.disconnect()

    expect(connection.isConnected()).toBe(false)
    expect(connection.isDisconnected()).toBe(true)
  })
})

test.group('createMongodbConnection', async () => {
  test('creates connection', async ({ expect }) => {
    const app = makeAppWithMongodbConfig()
    app.config().set('mongodb.connections.testing', { url: 'mongodb://localhost' })

    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    const connection = await mongodb.connection('testing')

    expect(connection.isConnected()).toBe(true)
    await connection.disconnect()
  })

  test('creates connection from host and database', async ({ expect }) => {
    const app = makeAppWithMongodbConfig()
    app.config().set('mongodb.connections.host-and-db', { host: 'localhost', database: 'testing' })

    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    const connection = await mongodb.connection('host-and-db')

    expect(connection.isConnected()).toBe(true)
    await connection.disconnect()
  })

  test('creates connection from host, port, and database', async ({ expect }) => {
    const app = makeAppWithMongodbConfig()
    app.config().set('mongodb.connections.host-port-db', { host: 'localhost', port: 27017, database: 'testing' })

    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    const connection = await mongodb.connection('host-port-db')

    expect(connection.isConnected()).toBe(true)
    await connection.disconnect()
  })

  test('throws when not providing a host', async ({ expect }) => {
    const app = makeAppWithMongodbConfig()
    app.config().set('mongodb.connections.no-host', { database: 'testing' })

    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    expect(
      mongodb.connection('no-host')
    ).rejects.toThrow('Missing MongoDB host')
  })

  test('throws when creating non-existing connection', async ({ expect }) => {
    const app = makeAppWithMongodbConfig()

    const mongodb = new MongodbManager(app, app.config().get('mongodb'))
    expect(
      mongodb.connection('not-existing')
    ).rejects.toThrow('Missing MongoDB connection configuration')
  })
})

test.group('validateConfig', async () => {
  test('throws when missing mongodb configuration', async ({ expect }) => {
    const app = makeApp()

    expect(() => {
      return new MongodbManager(app, app.config().get('mongodb'))
    }).toThrow('Missing "mongodb" configuration file')
  })

  test('throws when missing mongodb default connection', async ({ expect }) => {
    app.config().set('mongodb', { })

    expect(() => {
      return new MongodbManager(app, app.config().get('mongodb'))
    }).toThrow('Missing default MongoDB connection name')
  })

  test('throws when missing mongodb connections', async ({ expect }) => {
    app.config().set('mongodb', { default: 'local' })

    expect(() => {
      return new MongodbManager(app, app.config().get('mongodb'))
    }).toThrow('Missing MongoDB connections configuration')
  })
})
