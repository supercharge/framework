'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('tap')
const { makeApp } = require('../helpers')
const UserModel = require('../helpers/user-model')
const { DatabaseServiceProvider } = require('../../dist')

let app

test('Model', async t => {
  t.setTimeout(3000)

  t.before(async () => {
    const dbDirectory = t.testdir()
    app = makeApp(undefined, dbDirectory)

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

  t.test('findById', async t => {
    await UserModel.query().insert({ name: 'Supercharge' })

    const user = await UserModel.findById(1)
    t.same(user, { id: 1, name: 'Supercharge' })
  })

  t.test('finds when findByIdOrFail', async t => {
    const user = await UserModel.query().insert({ name: 'Supercharge' })

    t.same(await UserModel.findById(user.id).orFail(), user)
  })

  t.test('fails when findByIdOrFail', async t => {
    await t.rejects(async () => {
      return await UserModel.findByIdOrFail(12345)
    }, 'Cannot find instance for "UserModel"')
  })

  t.teardown(async () => {
    const db = app.make('db')

    if (await db.schema.hasTable(UserModel.tableName)) {
      await db.schema.dropTable(UserModel.tableName)
    }

    await db.destroy()
  })
})
