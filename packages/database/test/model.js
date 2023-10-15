
/**
 * @typedef {import('@supercharge/contracts').Database } Database
 */
const { test } = require('uvu')
const { expect } = require('expect')
const UserModel = require('./helpers/user-model')
const { DatabaseServiceProvider } = require('../dist')
const { makeApp, clearDbDirectory } = require('./helpers')

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

test.after(async () => {
  const db = app.make('db')

  if (await db.schema.hasTable(UserModel.tableName)) {
    await db.schema.dropTable(UserModel.tableName)
  }

  await db.destroy()

  await clearDbDirectory()
})

test('findById', async t => {
  await UserModel.query().insert({ name: 'Supercharge' })

  const user = await UserModel.findById(1)
  expect(user).toEqual({ id: 1, name: 'Supercharge' })
})

test('finds when findByIdOrFail', async t => {
  const user = await UserModel.query().insert({ name: 'Supercharge' })

  expect(
    await UserModel.findById(user.id).orFail()
  ).toEqual(user)
})

test('deleteById', async t => {
  const user = await UserModel.query().insert({ name: 'Supercharge' })

  const deleted = await UserModel.deleteById(user.id)
  expect(deleted).toBe(1)

  const deletedAgain = await UserModel.deleteById(user.id)
  expect(deletedAgain).toBe(0)
})

test.run()
