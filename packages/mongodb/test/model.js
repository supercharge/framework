'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { Arr } = require('@supercharge/arrays')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

test.group('Model', (group) => {
  class User extends Model {}

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

  test('find | with filter object', async () => {
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

  test('find | applies where filter', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.find().where({ name: 'Marcus' }))

    expect(users.length()).toBe(1)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(false)

    const notExistingUsers = Arr.from(await User.find({ name: 'NotExisting' }))
    expect(notExistingUsers.length()).toBe(0)
  })

  test('findOne', async () => {
    await User.create({ name: 'Marcus', isActive: true })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne().where({ name: 'Supercharge' })
    expect(user.name).toEqual('Supercharge')
  })

  test('findOne | returns the first match', async () => {
    await User.create({ name: 'Marcus', isActive: false })
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne().where({ isActive: true })
    expect(user._id).toBeDefined()
    expect(user.name).toEqual('Supercharge')
    expect(user.isActive).toEqual(true)
  })

  test('findOne | returns undefined', async () => {
    await User.create({ name: 'Supercharge', isActive: true })

    const user = await User.findOne().where({ isActive: false })
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

    await User.update({ $set: { name: 'Updated' } })

    const all = await User.all()
    expect(all).toMatchObject([
      { name: 'Updated' },
      { name: 'Updated' }
    ])
  })

  test('updateOne', async () => {
    const user = await User.create({ name: 'Supercharge' })

    await User.updateOne({ $set: { name: 'Updated' } }).where({ _id: user._id })

    const updated = await User.findById(user._id)
    expect(updated.name).toEqual('Updated')
  })

  test('updateOne | does nothing for non-existing document', async () => {
    const user = await User.create({ name: 'Supercharge' })
    await User.deleteById(user._id)

    expect(
      await User.updateOne({ $set: { name: 'Updated' } }).where({ _id: user._id })
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

  test('where', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = await User.where({ name: 'Supercharge' })
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBe(1)
    expect(users[0].name).toBe('Supercharge')
  })

  test('where | chainable', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const user = await User.where({ name: 'Supercharge' }).findOne()
    expect(typeof user === 'object').toBe(true)
    expect(user.name).toBe('Supercharge')
  })

  test('orFail | throws when not finding a document', async () => {
    await expect(
      User.find().orFail(() => {
        throw new Error('Failed from orFail')
      }).get()
    ).rejects.toThrow('Failed from orFail')
  })

  test('orFail | chainable and resolves', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const user = await User.findOne().where({ name: 'Supercharge' }).orFail(() => {
      throw new Error('Failed from orFail')
    })
    expect(typeof user === 'object').toBe(true)
    expect(user.name).toBe('Supercharge')
  })

  test('oldest', async () => {
    await User.create({ name: 'Marcus' })
    await User.create({ name: 'Supercharge' })

    const [marcus, supercharge] = await User.find().oldest()
    expect(marcus.name).toBe('Marcus')
    expect(supercharge.name).toBe('Supercharge')
  })

  test('latest', async () => {
    await User.create({ name: 'Marcus' })
    await User.create({ name: 'Supercharge' })

    const [supercharge, marcus] = await User.find().latest()
    expect(supercharge.name).toBe('Supercharge')
    expect(marcus.name).toBe('Marcus')
  })

  test('sort | ascending by default', async () => {
    await User.createMany([
      { name: 'Marcus', age: 987 },
      { name: 'Norman', age: 456 },
      { name: 'Christian', age: 123 }
    ])

    const [christian, norman, marcus] = await User.find().sort('age')
    expect(christian.name).toBe('Christian')
    expect(norman.name).toBe('Norman')
    expect(marcus.name).toBe('Marcus')
  })

  test('sort | asc(ending) using an object', async () => {
    await User.createMany([
      { name: 'Marcus', age: 123 },
      { name: 'Supercharge', age: 987 }
    ])

    const num = await User.find().sort({ age: 1 })
    expect(num[0].name).toBe('Marcus')
    expect(num[1].name).toBe('Supercharge')

    const desc = await User.find().sort({ age: 'asc' })
    expect(desc[0].name).toBe('Marcus')
    expect(desc[1].name).toBe('Supercharge')

    const descending = await User.find().sort({ age: 'ascending' })
    expect(descending[0].name).toBe('Marcus')
    expect(descending[1].name).toBe('Supercharge')
  })

  test('sort | desc(ending) using an object', async () => {
    await User.createMany([
      { name: 'Marcus', age: 123 },
      { name: 'Supercharge', age: 987 }
    ])

    const num = await User.find().sort({ age: -1 })
    expect(num[0].name).toBe('Supercharge')
    expect(num[1].name).toBe('Marcus')

    const desc = await User.find().sort({ age: 'desc' })
    expect(desc[0].name).toBe('Supercharge')
    expect(desc[1].name).toBe('Marcus')

    const descending = await User.find().sort({ age: 'descending' })
    expect(descending[0].name).toBe('Supercharge')
    expect(descending[1].name).toBe('Marcus')
  })

  test('aggregate | ascending using column', async () => {
    await User.createMany([
      { name: 'Marcus', age: 987 },
      { name: 'Norman', age: 456 },
      { name: 'Christian', age: 123 }
    ])

    const users = await User.aggregate(builder => {
      builder.sort('age', 'asc').limit(1)
    })

    expect(users.length).toBe(1)
    expect(users[0].age).toBe(123)
    expect(users[0].name).toBe('Christian')
  })

  test('aggregate | ascending using an object', async () => {
    await User.createMany([
      { name: 'Marcus', age: 987 },
      { name: 'Norman', age: 456 },
      { name: 'Christian', age: 123 }
    ])

    const users = await User.aggregate(builder => {
      builder.sort({ age: 'asc' }).limit(1)
    })

    expect(users.length).toBe(1)
    expect(users[0].name).toBe('Christian')
  })

  test('aggregate | descending using column', async () => {
    await User.createMany([
      { name: 'Norman', age: 456 },
      { name: 'Marcus', age: 987 },
      { name: 'Christian', age: 123 }
    ])

    const users = await User.aggregate(builder => {
      builder.sort('age', 'desc').limit(1)
    })

    expect(users.length).toBe(1)
    expect(users[0].age).toBe(987)
    expect(users[0].name).toBe('Marcus')
  })

  test('aggregate | descending using an object', async () => {
    await User.createMany([
      { name: 'Norman', age: 456 },
      { name: 'Marcus', age: 987 },
      { name: 'Christian', age: 123 }
    ])

    const users = await User.aggregate(builder => {
      builder.sort({ age: 'desc' }).limit(1)
    })

    expect(users.length).toBe(1)
    expect(users[0].age).toBe(987)
    expect(users[0].name).toBe('Marcus')
  })

  test('aggregate | fails when not providing a callback function', async () => {
    expect(() => {
      User.aggregate().orFail(() => {
        throw new Error('not called')
      })
    }).toThrow('You must provide a callback function as the first argument when calling Model.aggregate')
  })
})
