'use strict'

const { test } = require('@japa/runner')
const { Arr } = require('@supercharge/arrays')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

class User extends Model {}

test.group('Model', (group) => {
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
  })

  test('toJSON', async ({ expect }) => {
    const user = await User.create({ name: 'Supercharge' })

    expect(JSON.stringify(user)).toEqual(JSON.stringify({
      name: 'Supercharge', _id: user.id
    }))
  })

  test('all', async ({ expect }) => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.all())

    expect(users.length()).toBe(2)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(true)
  })

  test('find | returns all documents', async ({ expect }) => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.find())

    expect(users.length()).toBe(2)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(true)
  })

  test('find | returns filtered documents', async ({ expect }) => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.find({ name: 'Marcus' }))

    expect(users.length()).toBe(1)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(false)

    const notExistingUsers = Arr.from(await User.find({ name: 'NotExisting' }))
    expect(notExistingUsers.length()).toBe(0)
  })

  test('findOne', async ({ expect }) => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ name: 'Marcus' })
    expect(user.name).toEqual('Marcus')
  })

  test('findOne | returns the first match', async ({ expect }) => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ isActive: true })
    expect(user._id).toBeDefined()
    expect(user.name).toEqual('Marcus')
    expect(user.isActive).toEqual(true)
  })

  test('findOne | returns undefined', async ({ expect }) => {
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ isActive: false })
    expect(user).toBeUndefined()
  })

  test('findById', async ({ expect }) => {
    const supercharge = await User.create({ name: 'Supercharge' })

    const user = await User.findById(supercharge.id)
    expect(user).toBeDefined()
    expect(user.name).toEqual('Supercharge')
  })

  test('findById | returns undefined for non-existing ID', async ({ expect }) => {
    const supercharge = await User.create({ name: 'Supercharge' })
    await User.deleteById(supercharge._id)

    const deleted = await User.findById(supercharge._id)
    expect(deleted).toBeUndefined()
  })

  test('create', async ({ expect }) => {
    //
  }).skip(true)

  test('updateOne', async ({ expect }) => {
    //
  }).skip(true)

  test('truncate', async ({ expect }) => {
    //
  }).skip(true)

  test('delete', async ({ expect }) => {
    //
  }).skip(true)

  test('deleteOne', async ({ expect }) => {
    //
  }).skip(true)
})
