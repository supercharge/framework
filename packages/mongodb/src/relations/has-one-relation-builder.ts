'use strict'

import { RelationBuilder } from './relation-builder'
import { MongodbModel, Relation } from '../contracts'

export class HasOneRelationBuilder<ParentModel extends MongodbModel, RelatedModel extends MongodbModel> extends RelationBuilder<ParentModel, RelatedModel> {
  /**
   * Returns the resolved relation object.
   */
  override resolve (): Relation {
    return { ...super.resolve(), justOne: true }
  }
}
