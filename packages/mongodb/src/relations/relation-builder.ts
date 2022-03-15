'use strict'

import { tap } from '@supercharge/goodies'
import { MongodbModel, RelationBuilderContract, Relation } from '../contracts'

export class RelationBuilder<ParentModel extends MongodbModel, RelatedModel extends MongodbModel> implements RelationBuilderContract {
  protected readonly parent: ParentModel
  protected readonly related: RelatedModel

  protected readonly relation: Partial<Relation>

  /**
   * Create a new instance.
   */
  constructor (parent: ParentModel, related: RelatedModel) {
    this.relation = {}
    this.parent = parent
    this.related = related
  }

  /**
   * Assign the local `field` identifier in the local collection for this relationship.
   */
  localField (field: string): this {
    return tap(this, () => {
      this.relation.localField = field
    })
  }

  /**
   * Assign the foreign `field` identifier in the remote collection for this relationship.
   */
  foreignField (field: string): this {
    return tap(this, () => {
      this.relation.foreignField = field
    })
  }

  /**
   * Returns the resolved relation object.
   */
  resolve (): Relation {
    return {
      justOne: false,
      collection: this.related.collection,
      localField: this.relation.localField ?? '_id',
      foreignField: this.relation.foreignField ?? '',
      ownerModelClass: this.parent,
      foreignModelClass: this.related
    }
  }
}
