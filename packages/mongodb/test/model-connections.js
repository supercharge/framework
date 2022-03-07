'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { Arr } = require('@supercharge/arrays')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

test.group('Model Connections', (group) => {
  class User extends Model {
    static get connection () {
      return 'testing'
    }
  }

  group.setup(async () => {
    Model.setConnectionResolver(mongodb)
  })

  group.each.setup(async () => {
    await User.delete()
  })

  group.teardown(async () => {
    await mongodb.disconnectAll()
  })

  test('uses configured connection', async () => {
    const user = new User({})
    const connection = await user.getConnection()

    expect(connection.db().databaseName).toBe('supercharge-testing-connections')
  })

  test('can create documents on configured connection', async () => {
    await User.createMany([
      { name: 'Marcus' },
      { name: 'Supercharge' }
    ])

    const users = Arr.from(await User.all())

    expect(users.length()).toBe(2)
    expect(users.has(user => user.name === 'Marcus')).toBe(true)
    expect(users.has(user => user.name === 'Supercharge')).toBe(true)
  })
})
