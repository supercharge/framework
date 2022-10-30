'use strict'

import { QueryBuilder } from './query-builder'
import { Constructor, MaybeCompositeId, MaybeSingleQueryBuilder, Model as BaseModel, NumberQueryBuilder, QueryBuilderType, TransactionOrKnex } from 'objection'

export class Model extends BaseModel {
  /**
   * Both of these type definitions are needed to make sure that every model
   * inheriting from this base class has the fluent query builder available.
   */
  override QueryBuilderType!: QueryBuilder<this>
  static override QueryBuilder = QueryBuilder

  /**
   * Find an item of this model for the given `id`.
   */
  static findById<M extends Model> (this: Constructor<M>, id: MaybeCompositeId, trx?: TransactionOrKnex): MaybeSingleQueryBuilder<QueryBuilderType<M>> {
    return (this as unknown as typeof Model).query(trx).findById(id)
  }

  /**
   * Delete an item of this model for the given `id`.
   */
  static deleteById<M extends Model> (this: Constructor<M>, id: MaybeCompositeId, trx?: TransactionOrKnex): NumberQueryBuilder<QueryBuilderType<M>> {
    return (this as unknown as typeof Model).query(trx).deleteById(id)
  }
}
