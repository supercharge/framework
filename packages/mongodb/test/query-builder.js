'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

class QueryBuilderModel extends Model {}

test.group('QueryBuilder', (group) => {
  group.setup(async () => {
    await mongodb.boot()

    Model.setConnectionResolver(mongodb)
  })

  group.each.setup(async () => {
    await QueryBuilderModel.delete()
  })

  group.teardown(async () => {
    const connection = await mongodb.connection()
    await connection.disconnect()
  })

  test('orFail', async () => {
    await expect(
      QueryBuilderModel.query().orFail(() => {
        throw new Error('Failed from orFail')
      }).findOne()
    ).rejects.toThrow('Failed from orFail')
  })

  test('orFail | does not fail when finding a document', async () => {
    await QueryBuilderModel.create({ name: 'not failed' })

    const found = await QueryBuilderModel.query().orFail(() => {
      throw new Error('Failed from orFail')
    }).findOne()

    expect(found.name).toBe('not failed')
  })
})
