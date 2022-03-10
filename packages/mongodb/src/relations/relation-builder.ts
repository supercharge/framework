'use strict'

import { tap } from '@supercharge/goodies'
import { MongodbDocument, MongodbModel, RelationBuilderContract, RelationContract } from '../contracts'

export class RelationBuilder<ParentClass extends MongodbDocument, T extends MongodbModel> implements RelationBuilderContract {
  private readonly parent: ParentClass
  private readonly related: T

  private readonly relation: Partial<RelationContract>

  constructor (parent: any, related: T | (() => T)) {
    this.relation = {}
    this.parent = parent
    this.related = this.resolveRelated(related)
  }

  private resolveRelated (related: T | (() => T)): T {
    return typeof related !== 'function'
      ? related
      : related() as any
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

  resolve (): any {
    // return {
    //   collection: this.parent.model().collection,
    //   localField?: this.relation.localField,
    //   foreignField: this.relation.foreignField ?? '',
    //   ownerModelClass: MongodbModel,
    //   remoteModelClass: this.parent.model()

    // }
  }
}
