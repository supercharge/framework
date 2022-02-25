'use strict'

const { test } = require('@japa/runner')
const { Database, Model } = require('../dist')

const db = new Database('mongodb://localhost/testing-model-class')

class User extends Model {}

test.group('Model', (group) => {
  group.setup(async () => {
    db.register(User)

    await db.connect()
    await User.delete()
  })

  group.teardown(async () => {
    await db.disconnect()
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

    const updated = await User.findById(user.id)
    expect(updated.name).toEqual('Marcus')
  })
})
