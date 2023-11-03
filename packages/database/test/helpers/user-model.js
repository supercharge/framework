
import PostModel from './post-model.js'
import { Model } from '../../dist/index.js'

export default class UserModel extends Model {
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
    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: PostModel,
        join: { from: `${this.tableName}.id`, to: 'posts.userId' }
      }
    }
  }
}
