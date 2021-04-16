'use strict'

import { Model, Page, QueryBuilder as BaseQueryBuilder } from 'objection'

export class QueryBuilder<M extends Model, R = M[]> extends BaseQueryBuilder<M, R> {
  /**
   * The following properties are necessary to have proper TypeScript support.
   */
  ArrayQueryBuilderType!: QueryBuilder<M, M[]>
  SingleQueryBuilderType!: QueryBuilder<M, M>
  NumberQueryBuilderType!: QueryBuilder<M, number>
  PageQueryBuilderType!: QueryBuilder<M, Page<M>>

  /**
   * Fails the query if the result set is empty. Use the given `callback` to
   * throw a custom error. Otherwise, this method throws a generic `Error`.
   *
   * @param {Function} callback
   *
   * @returns {QueryBuilder}
   */
  public orFail (callback?: () => void): this {
    return this.runAfter((result: any) => {
      if (this.hasResults(result)) {
        return result
      }

      if (typeof callback === 'function') {
        callback()
      }

      throw new Error(`Cannot find model ${String(this.modelClass)}`)
    })
  }

  /**
   * Determine whether the given `result` contains items in the query result.
   *
   * @param result
   *
   * @returns {Boolean}
   */
  private hasResults (result: any): boolean {
    return (Array.isArray(result) && result.length > 0) ||
        (Array.isArray(result.results) && result.results.length > 0)
  }
}
