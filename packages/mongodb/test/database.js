'use strict'

const { Database } = require('../dist')
const { test } = require('@japa/runner')

test('connect', async ({ expect }) => {
  const db = new Database('mongodb://localhost')
  await db.connect()

  expect(db.isConnected()).toBe(true)

  await db.disconnect()
})

test('isDisconnected', async ({ expect }) => {
  const db = new Database('mongodb://localhost')
  expect(db.isDisconnected()).toBe(true)

  await db.connect()

  expect(db.isConnected()).toBe(true)

  await db.disconnect()
})
