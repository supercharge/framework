'use strict'

const expect = require('expect')
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

  test('all', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.all())

    expect(users.length()).toBe(2)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(true)
  })

  test('find | returns all documents', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.find())

    expect(users.length()).toBe(2)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(true)
  })

  test('find | returns filtered documents', async () => {
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

  test('findOne', async () => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ name: 'Marcus' })
    expect(user.name).toEqual('Marcus')
  })

  test('findOne | returns the first match', async () => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ isActive: true })
    expect(user._id).toBeDefined()
    expect(user.name).toEqual('Marcus')
    expect(user.isActive).toEqual(true)
  })

  test('findOne | returns undefined', async () => {
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne({ isActive: false })
    expect(user).toBeUndefined()
  })

  test('findById', async () => {
    const supercharge = await User.create({ name: 'Supercharge' })

    const user = await User.findById(supercharge.id)
    expect(user).toBeDefined()
    expect(user.name).toEqual('Supercharge')
  })

  test('findById | returns undefined for non-existing ID', async () => {
    const supercharge = await User.create({ name: 'Supercharge' })
    await User.deleteById(supercharge._id)

    const deleted = await User.findById(supercharge._id)
    expect(deleted).toBeUndefined()
  })

  test('create', async () => {
    const supercharge = await User.create({ name: 'Supercharge' })
    expect(supercharge.name).toBe('Supercharge')

    const idOnly = await User.create({ })
    expect(idOnly.id).toBeDefined()
    expect(idOnly._id).toBeDefined()
    expect(idOnly.name).toBeUndefined()
  })

  test('update', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    await User.update({}, { $set: { name: 'Updated' } })

    const all = await User.all()
    expect(all).toMatchObject([
      { name: 'Updated' },
      { name: 'Updated' }
    ])
  })

  test('updateOne', async () => {
    const user = await User.create({ name: 'Supercharge' })

    await User.updateOne({ _id: user._id }, { $set: { name: 'Updated' } })

    const updated = await User.findById(user._id)
    expect(updated.name).toEqual('Updated')
  })

  test('updateOne | does nothing for non-existing document', async () => {
    const user = await User.create({ name: 'Supercharge' })
    await User.deleteById(user._id)

    expect(
      await User.updateOne({ _id: user._id }, { $set: { name: 'Updated' } })
    ).toBeUndefined()
  })

  test('truncate', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    expect(await User.count()).toBe(2)

    await User.truncate()
    expect(await User.count()).toBe(0)
  })

  test('delete | truncates all documents without filter', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    expect(await User.count()).toBe(2)

    await User.delete()
    expect(await User.count()).toBe(0)
  })

  test('delete | truncates filtered documents', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    expect(await User.count()).toBe(2)

    await User.delete({ name: 'Marcus' })

    const users = await User.all()
    expect(users.length).toBe(1)
    expect(users[0].name).toBe('Supercharge')
  })

  test('deleteOne', async () => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const result = await User.deleteOne({ isActive: true })
    expect(result.deletedCount).toBe(1)

    const users = await User.all()
    expect(users.length).toBe(1)
    expect(users[0].name).toBe('Supercharge')
  })

  test('count', async () => {
    expect(await User.count()).toBe(0)

    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    expect(await User.count()).toBe(2)
  })

  test('count | with filter', async () => {
    expect(await User.count({ name: 'Supercharge' })).toBe(0)

    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    expect(await User.count({ name: 'Supercharge' })).toBe(1)
  })
})
