'use strict'

const { test } = require('@japa/runner')
const { makeApp } = require('./helpers')
const { MongodbManager } = require('../dist')

const app = makeApp()

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
