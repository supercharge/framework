'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

test.group('Model Joins/Lookups', (group) => {
  class User extends Model {}
  class Order extends Model {}

  group.setup(async () => {
    await mongodb.boot()

    Model.setConnectionResolver(mongodb)
  })

  group.each.setup(async () => {
    await User.delete()
    await Order.delete()
  })

  group.teardown(async () => {
    const connection = await mongodb.connection()
    await connection.disconnect()
  })

  test('aggregate | lookup builder', async () => {
    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const users = await User.aggregate(builder => {
      builder.lookup(lookup => {
        lookup.from('orders').as('orders').foreignField('userId').localField('_id')
      })
    })

    expect(users.length).toBe(2)
    users.every(user => {
      return expect(user.orders).toBeDefined()
    })

    expect(users[0].orders.length).toBe(2)
    expect(users[0].orders).toEqual([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' }
    ])

    expect(users[1].orders).toEqual([
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])
  })

  test('aggregate with where', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const users = await User
      .where({
        $or: [
          { _id: 1 },
          { name: 'Supercharge' }
        ]
      })
      .with('orders')
      .aggregate(builder => {
        builder.skip(1)
      })

    expect(users.length).toBe(1)
    expect(users[0].name).toEqual('Supercharge')
    expect(users[0].orders.length).toBe(2)
    expect(users[0].orders).toEqual([
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])
  })

  test('findById with | resolves hasOne relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          order: this.hasOne(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const marcus = await User.findById(1).with('order')
    expect(marcus instanceof User).toBe(true)
    expect(marcus.order instanceof Order).toBe(true)
  })

  test('findById with | resolves hasMany relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const marcus = await User.findById(1).with('orders')
    expect(marcus instanceof User).toBe(true)

    expect(Array.isArray(marcus.orders)).toBe(true)
    expect(marcus.orders.length).toBe(2)
    expect(marcus.orders.every(order => order instanceof Order)).toBe(true)
  })

  test('findById with | resolves hasMany to empty array when not finding matches', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' }
    ])

    const marcus = await User.findById(2).with('orders')
    expect(marcus instanceof User).toBe(true)
    expect(marcus.orders).toEqual([])
  })

  test('with | fails when joining missing relation name', async () => {
    class User extends Model {
      static get relations () {
        return {
          order: this.hasOne(Order)
        }
      }
    }

    expect(() => {
      User.with('notDefined')
    }).toThrow('Relation "notDefined" is not defined on your "User" model')
  })

  test('relation builder | fails when not providing a related model', async () => {
    expect(() => {
      class User extends Model {
        static get relations () {
          return {
            order: this.hasOne()
          }
        }
      }

      User.with('order')
    }).toThrow('Missing model class argument in one of your "hasOne" relations inside the "User" model')
  })

  test('relation builder | resolves localField automatically to _id', async () => {
    class User extends Model {
      static get relations () {
        return {
          order: this.hasOne(Order).foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const marcus = await User.findById(1).with('order')
    expect(marcus instanceof User).toBe(true)
    expect(marcus.order instanceof Order).toBe(true)
  })

  test('findOne with | resolves hasOne relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          order: this.hasOne(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const supercharge = await User.findOne({ name: 'Supercharge' }).with('order')
    expect(supercharge instanceof User).toBe(true)
    expect(supercharge.order instanceof Order).toBe(true)
    expect(supercharge.order.item).toBe('phones')
  })

  test('findOne with | resolves hasMany relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const supercharge = await await User.findOne({ name: 'Supercharge' }).with('orders')
    expect(supercharge instanceof User).toBe(true)

    expect(Array.isArray(supercharge.orders)).toBe(true)
    expect(supercharge.orders.length).toBe(2)
    expect(supercharge.orders.every(order => order instanceof Order)).toBe(true)
  })

  test('findOne with | resolves hasMany to empty array when not finding matches', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' }
    ])

    const supercharge = await User.findOne({ _id: 2 }).with('orders')
    expect(supercharge instanceof User).toBe(true)
    expect(supercharge.orders).toEqual([])
  })

  test('find with | resolves hasOne relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          order: this.hasOne(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 1, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const users = await User.find().with('order')
    expect(Array.isArray(users)).toBe(true)
    expect(users.every(user => user instanceof User)).toBe(true)
    expect(users.every(user => user.order instanceof Order)).toBe(true)
  })

  test('find with | resolves hasMany relation', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const users = await await User.find().with('orders')
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBe(2)
    expect(users.every(user => user instanceof User)).toBe(true)
    expect(users.every(user => Array.isArray(user.orders))).toBe(true)

    expect(users[0].orders.length).toBe(1)
    expect(users[1].orders.length).toBe(2)
  })

  test('find with | resolves hasMany to empty array when not finding matches', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' }
    ])

    const users = await User.find().with('orders')
    expect(Array.isArray(users)).toBe(true)

    const marcus = users[0]
    expect(marcus.name).toEqual('Marcus')
    expect(Array.isArray(marcus.orders)).toBe(true)
    expect(marcus.orders.length).toBe(1)
    expect(marcus.orders[0].item).toBe('shoes')

    const supercharge = users[1]
    expect(supercharge.name).toEqual('Supercharge')
    expect(Array.isArray(supercharge.orders)).toBe(true)
    expect(supercharge.orders.length).toBe(0)
  })

  test('find where with | resolves hasMany to empty array when not finding matches', async () => {
    class User extends Model {
      static get relations () {
        return {
          orders: this.hasMany(Order).localField('_id').foreignField('userId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Order.createMany([
      { _id: 1, userId: 1, quantity: 2, price: 10, item: 'shoes' },
      { _id: 2, userId: 2, quantity: 1, price: 15, item: 'phones' },
      { _id: 3, userId: 2, quantity: 4, price: 20, item: 'headphones' }
    ])

    const users = await User.find().with('orders').where({ name: 'Supercharge' })
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBe(1)

    const supercharge = users[0]
    expect(supercharge.name).toEqual('Supercharge')
    expect(Array.isArray(supercharge.orders)).toBe(true)
    expect(supercharge.orders.length).toBe(2)
    expect(supercharge.orders[0].item).toBe('phones')
    expect(supercharge.orders[1].item).toBe('headphones')
  })
})
