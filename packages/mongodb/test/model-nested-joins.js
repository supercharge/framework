'use strict'

const expect = require('expect')
const { test } = require('@japa/runner')
const { MongodbManager, Model } = require('../dist')
const { makeAppWithMongodbConfig } = require('./helpers')

const app = makeAppWithMongodbConfig()
const mongodb = new MongodbManager(app, app.config().get('mongodb'))

test.group('Model Nested Joins/Lookups', (group) => {
  class User extends Model {}
  class Post extends Model {}
  class Comment extends Model {}

  group.setup(async () => {
    await mongodb.boot()

    Model.setConnectionResolver(mongodb)
  })

  group.each.setup(async () => {
    await User.delete()
    await Post.delete()
    await Comment.delete()
  })

  group.teardown(async () => {
    const connection = await mongodb.connection()
    await connection.disconnect()
  })

  test('findById with | resolves nested hasMany -> hasMany relations', async () => {
    class User extends Model {
      static get relations () {
        return {
          posts: this.hasMany(Post).localField('_id').foreignField('userId')
        }
      }
    }

    class Post extends Model {
      static get relations () {
        return {
          comments: this.hasMany(Comment).localField('_id').foreignField('postId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Post.createMany([
      { _id: 1, userId: 1, title: 'MongoDB is awesome' },
      { _id: 2, userId: 1, title: 'Supercharge is awesome' },
      { _id: 3, userId: 2, title: 'We should keep an ey on coffee' }
    ])

    await Comment.createMany([
      { _id: 1, postId: 1, title: 'Yeah agree, MongoDB is the best' },
      { _id: 2, postId: 1, title: 'Nah, it is coming along and can be improved' },
      { _id: 3, postId: 2, title: 'Dude, this is so true. Cannot live without Supercharge!' },
      { _id: 4, postId: 3, title: 'This comment should not be fetched during any nested lookup' }
    ])

    const marcus = await User.findById(1).with('posts.comments')

    expect(marcus instanceof User).toBe(true)
    expect(marcus.posts.every(post => post instanceof Post)).toBe(true)
    expect(marcus.posts.every(post => {
      return post.comments.every(comment => comment instanceof Comment)
    })).toBe(true)
  })

  test('findById with | resolves nested hasOne -> hasMany relations', async () => {
    class User extends Model {
      static get relations () {
        return {
          post: this.hasOne(Post).localField('_id').foreignField('userId')
        }
      }
    }

    class Post extends Model {
      static get relations () {
        return {
          comments: this.hasMany(Comment).localField('_id').foreignField('postId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Post.createMany([
      { _id: 1, userId: 1, title: 'MongoDB is awesome' },
      { _id: 2, userId: 1, title: 'Supercharge is awesome' },
      { _id: 3, userId: 2, title: 'We should keep an ey on coffee' }
    ])

    await Comment.createMany([
      { _id: 1, postId: 1, title: 'Yeah agree, MongoDB is the best' },
      { _id: 2, postId: 1, title: 'Nah, it is coming along and can be improved' },
      { _id: 3, postId: 2, title: 'Dude, this is so true. Cannot live without Supercharge!' },
      { _id: 4, postId: 3, title: 'This comment should not be fetched during any nested lookup' }
    ])

    const marcus = await User.findById(1).with('post.comments')

    expect(marcus instanceof User).toBe(true)
    expect(marcus.post instanceof Post).toBe(true)
    expect(marcus.post.comments.every(comment => comment instanceof Comment)).toBe(true)
  })

  test('findById with | resolves nested hasMany -> hasOne relations', async () => {
    class User extends Model {
      static get relations () {
        return {
          posts: this.hasMany(Post).localField('_id').foreignField('userId')
        }
      }
    }

    class Post extends Model {
      static get relations () {
        return {
          comment: this.hasOne(Comment).localField('_id').foreignField('postId')
        }
      }
    }

    await User.createMany([
      { _id: 1, name: 'Marcus' },
      { _id: 2, name: 'Supercharge' }
    ])

    await Post.createMany([
      { _id: 1, userId: 1, title: 'MongoDB is awesome' },
      { _id: 2, userId: 1, title: 'Supercharge is awesome' },
      { _id: 3, userId: 2, title: 'We should keep an ey on coffee' }
    ])

    await Comment.createMany([
      { _id: 1, postId: 1, title: 'Yeah agree, MongoDB is the best' },
      { _id: 2, postId: 1, title: 'Nah, it is coming along and can be improved' },
      { _id: 3, postId: 2, title: 'Dude, this is so true. Cannot live without Supercharge!' },
      { _id: 4, postId: 3, title: 'This comment should not be fetched during any nested lookup' }
    ])

    const marcus = await User.findById(1).with('posts.comment')

    expect(marcus instanceof User).toBe(true)
    expect(marcus.posts.every(post => post instanceof Post)).toBe(true)
    expect(marcus.posts.every(post => post.comment instanceof Comment)).toBe(true)
  })
})
