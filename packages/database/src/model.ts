'use strict'

import { QueryBuilder } from './query-builder'
import { MaybeCompositeId, Model as BaseModel, TransactionOrKnex } from 'objection'

export class Model extends BaseModel {
  /**
   * Both of these type definitions are needed to make sure that every model
   * inheriting from this base class has the fluent query builder available.
   */
  QueryBuilderType!: QueryBuilder<this>
  static QueryBuilder = QueryBuilder

  /**
   * Find item of this model by the given `id`.
   */
  static findById (id: MaybeCompositeId, trx?: TransactionOrKnex): QueryBuilder<Model, Model | undefined> {
    return this.query(trx).findById(id)
  }
}
