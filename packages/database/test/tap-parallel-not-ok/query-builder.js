'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { makeApp } = require('../helpers')
const UserModel = require('../helpers/user-model')
const { DatabaseServiceProvider } = require('../../dist')
const { test, setTimeout, before, teardown } = require('tap')

const app = makeApp()

setTimeout(3000)

before(async () => {
  app.register(new DatabaseServiceProvider(app))

  const db = app.make('db')
  const tableName = UserModel.tableName

  if (await db.schema.hasTable(tableName)) {
    await db.schema.dropTable(tableName)
  }

  await db.schema.createTable(tableName, table => {
    table.increments('id')
    table.string('name')
  })
})

test('orFail with own error', async t => {
  await t.rejects(async () => {
    return await UserModel.query().findById(1234).orFail(() => {
      throw new Error('Cannot find user for ID 1234')
    })
  }, 'Cannot find user for ID 1234')
})

test('findAll', async t => {
  const names = ['Marcus', 'Norman', 'Christian']

  const inserted = await Promise.all(
    names.map(async name => {
      return await UserModel.query().insert({ name })
    })
  )

  const users = await UserModel.query().orFail()
  t.same(users, inserted)
})

test('orFail with own error', async t => {
  await t.rejects(async () => {
    return await UserModel.query().findById(1234).orFail(() => {
      throw new Error('Cannot find user for ID 1234')
    })
  }, 'Cannot find user for ID 1234')
})

teardown(async () => {
  const db = app.make('db')

  if (await db.schema.hasTable(UserModel.tableName)) {
    await db.schema.dropTable(UserModel.tableName)
  }

  await db.destroy()
})
