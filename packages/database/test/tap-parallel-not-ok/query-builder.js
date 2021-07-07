'use strict'

/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('tap')
const { makeApp } = require('../helpers')
const UserModel = require('../helpers/user-model')
const { DatabaseServiceProvider } = require('../../dist')

let app

test('Query Builder', async t => {
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

  t.test('orFail with own error', async t => {
    await t.rejects(async () => {
      return await UserModel.query().findById(1234).orFail(() => {
        throw new Error('Cannot find user for ID 1234')
      })
    }, 'Cannot find user for ID 1234')
  })

  t.test('findAll', async t => {
    const names = ['Marcus', 'Norman', 'Christian']

    const inserted = await Promise.all(
      names.map(async name => {
        return await UserModel.query().insert({ name })
      })
    )

    const users = await UserModel.query().orFail()
    t.same(users, inserted)
  })

  t.test('orFail with own error', async t => {
    await t.rejects(async () => {
      return await UserModel.query().findById(1234).orFail(() => {
        throw new Error('Cannot find user for ID 1234')
      })
    }, 'Cannot find user for ID 1234')
  })

  t.teardown(async () => {
    const db = app.make('db')

    if (await db.schema.hasTable(UserModel.tableName)) {
      await db.schema.dropTable(UserModel.tableName)
    }

    await db.destroy()
  })
})
