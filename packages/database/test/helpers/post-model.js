
import UserModel from './user-model.js'
import { Model } from '../../dist/index.js'

export default class PostModel extends Model {
  static get tableName () {
    return 'posts'
  }

  static get jsonSchema () {
    return {
      type: 'object',

      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        userId: { type: 'integer', relation: 'user' }
      }
    }
  }

  static get relationMappings () {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: { from: 'posts.userId', to: `${UserModel.tableName}.id` }
      }
    }
  }
}
