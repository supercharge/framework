'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

class User extends Model {}

test.group('Document', (group) => {
  group.setup(async () => {
    await mongodb.boot()

    Model.setConnectionResolver(mongodb)
  })

  group.each.setup(async () => {
    await User.delete()
  })

  group.teardown(async () => {
    const connection = await mongodb.connection()
    await connection.disconnect()
  })

  test('create', async () => {
    const user = await User.create({ name: 'Supercharge' })

    expect(Object.keys(user)).toEqual(['name', '_id'])
    expect(user.name).toBe('Supercharge')
    expect(user.id).not.toBeUndefined()
  })

  test('update', async () => {
    const user = await User.create({ name: 'Supercharge' })
    await user.update({ name: 'Updated' })

    const updated = await User.findById(user._id)
    expect(updated.name).toEqual('Updated')
  })

  test('delete', async () => {
    const user = await User.create({ name: 'Supercharge' })
    await user.delete()

    const updated = await User.findById(user._id)
    expect(updated).toBeUndefined()
  })

  test('delete | fails when document is not persistet', async () => {
    const user = new User({ name: 'Supercharge' })
    await user.delete()

    const updated = await User.findById(user._id)
    expect(updated).toBeUndefined()
  }).skip(true)

  test('toJSON', async () => {
    const user = await User.create({ name: 'Supercharge' })

    expect(JSON.stringify(user)).toEqual(JSON.stringify({
      name: 'Supercharge', _id: user.id
    }))
  })
})
