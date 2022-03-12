'use strict'

import { RelationBuilder } from './relation-builder'
import { MongodbModel, RelationBuilderResult } from '../contracts'

export class HasOneRelationBuilder<ParentModel extends MongodbModel, RelatedModel extends MongodbModel> extends RelationBuilder<ParentModel, RelatedModel> {
  /**
   * Returns the resolved relation object.
   */
  override resolve (): RelationBuilderResult {
    return {
      justOne: true,
      collection: this.parent.collection,
      localField: this.relation.localField ?? '_id',
      foreignField: this.relation.foreignField ?? '',
      ownerModelClass: this.parent,
      remoteModelClass: this.related
    }
  }
}
