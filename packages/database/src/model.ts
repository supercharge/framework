'use strict'

import { QueryBuilder } from './query-builder'
import { Constructor, MaybeCompositeId, Model as BaseModel, TransactionOrKnex } from 'objection'

export class Model extends BaseModel {
  /**
   * Both of these type definitions are needed to make sure that every model
   * inheriting from this base class has the fluent query builder available.
   */
  QueryBuilderType!: QueryBuilder<this>
  static QueryBuilder = QueryBuilder

  /**
   * Find an item of this model for the given `id`.
   */
  static findById<M extends Model> (this: Constructor<M>, id: MaybeCompositeId, trx?: TransactionOrKnex): QueryBuilder<M, M | undefined> {
    // @ts-expect-error
    return this.query(trx).findById(id) as any
  }

  /**
   * Delete an item of this model for the given `id`.
   */
  static deleteById<M extends Model> (this: Constructor<M>, id: MaybeCompositeId, trx?: TransactionOrKnex): QueryBuilder<M, number> {
    // @ts-expect-error
    return this.query(trx).deleteById(id) as any
  }
}
