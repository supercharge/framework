'use strict'

import { QueryBuilder } from './query-builder'
import { Model as BaseModel } from 'objection'

export class Model extends BaseModel {
  /**
   * Both of these type definitions are needed to make sure that every model
   * inheriting from this base class has the fluent query builder available.
   */
  QueryBuilderType!: QueryBuilder<this>
  static QueryBuilder = QueryBuilder
}
