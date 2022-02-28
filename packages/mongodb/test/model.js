'use strict'

const { test } = require('@japa/runner')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

class User extends Model {}

test.group('Model', (group) => {
  group.setup(async () => {
    await mongodb.boot()

    Model.setConnectionResolver(mongodb)
    await User.delete()
  })

  group.teardown(async () => {
    const connection = await mongodb.connection()
    await connection.disconnect()
  })

  test('create', async ({ expect }) => {
    const user = await User.create({ name: 'Supercharge' })

    expect(Object.keys(user)).toEqual(['name', '_id'])
    expect(user.name).toBe('Supercharge')
    expect(user.id).not.toBeUndefined()
  })

  test('update', async ({ expect }) => {
    const user = await User.create({ name: 'Update-Supercharge' })
    await user.update({ name: 'Marcus' })

    const updated = await User.findById(user._id)
    expect(updated.name).toEqual('Marcus')
  }).skip()
})
