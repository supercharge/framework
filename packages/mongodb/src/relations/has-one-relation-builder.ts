'use strict'

import { tap } from '@supercharge/goodies'
import { MongodbDocument, RelationBuilderContract, RelationContract } from '../contracts'

export class RelationBuilder<ParentClass extends MongodbDocument> implements RelationBuilderContract {
  private readonly parent: ParentClass

  private readonly relation: Partial<RelationContract>

  constructor (parent: ParentClass) {
    this.relation = {}
    this.parent = parent
  }

  from (collection: string): this {
    return tap(this, () => {
      this.relation.collection = collection
    })
  }

  remoteField (field: string): this {
    return tap(this, () => {
      this.relation.localField = field
    })
  }

  localField (field: string): this {
    return tap(this, () => {
      this.relation.localField = field
    })
  }

  resolve (): RelationContract {
    return {
      collection: this.parent.model().collection,
      localField?: this.relation.localField,
      foreignField: this.relation.foreignField ?? '',
      ownerModelClass: MongodbModel,
      remoteModelClass: this.parent.model()

    }
  }
}
