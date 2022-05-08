'use strict'

const { Model } = require('../../dist')

module.exports = class UserModel extends Model {
  static get tableName () {
    return 'users_table'
  }

  static get jsonSchema () {
    return {
      type: 'object',

      properties: {
        id: { type: 'number' },
        name: { type: 'string' }
      }
    }
  }

  static get relationMappings () {
    const PostModel = require('./post-model')

    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: PostModel,
        join: { from: `${this.tableName}.id`, to: 'posts.userId' }
      }
    }
  }
}
