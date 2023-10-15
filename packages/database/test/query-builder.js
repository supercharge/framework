
/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('uvu')
const { expect } = require('expect')
const { makeApp, clearDbDirectory } = require('./helpers')
const UserModel = require('./helpers/user-model')
const { DatabaseServiceProvider } = require('../dist')

let app

test.before(async () => {
  app = makeApp()

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

test.before.each(async () => {
  await UserModel.query().delete()
})

test.after(async () => {
  const db = app.make('db')

  if (await db.schema.hasTable(UserModel.tableName)) {
    await db.schema.dropTable(UserModel.tableName)
  }

  await db.destroy()

  await clearDbDirectory()
})

test('orFail', async () => {
  await expect(
    UserModel.query().findById(1234).orFail()
  ).rejects.toThrow('Failed to find instance for "UserModel"')
})

test('orFail with own error', async () => {
  await expect(
    UserModel.query().findById(1234).orFail(() => {
      throw new Error('Cannot find user for ID 1234')
    })
  ).rejects.toThrow('Cannot find user for ID 1234')
})

test('findAll', async () => {
  const names = ['Marcus', 'Norman', 'Christian']

  const inserted = await Promise.all(
    names.map(async name => {
      return await UserModel.query().insert({ name })
    })
  )

  const users = await UserModel.query().orFail()
  expect(users).toEqual(inserted)
})

test('findAll orFail', async () => {
  const names = ['Marcus', 'Norman', 'Christian']

  await Promise.all(
    names.map(async name => {
      return await UserModel.query().insert({ name })
    })
  )

  await expect(
    UserModel.query().where('id', '>', 1000).orFail()
  ).rejects.toThrow('Failed to find instance for "UserModel"')
})

test.run()
