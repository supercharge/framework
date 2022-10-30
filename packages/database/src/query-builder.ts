'use strict'

import { Model, Page, QueryBuilder as BaseQueryBuilder } from 'objection'

export class QueryBuilder<M extends Model, R = M[]> extends BaseQueryBuilder<M, R> {
  /**
   * The following properties are necessary to have proper TypeScript support.
   */
  override ArrayQueryBuilderType!: QueryBuilder<M, M[]>
  override SingleQueryBuilderType!: QueryBuilder<M, M>
  override MaybeSingleQueryBuilderType!: QueryBuilder<M, M | undefined>
  override NumberQueryBuilderType!: QueryBuilder<M, number>
  override PageQueryBuilderType!: QueryBuilder<M, Page<M>>

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

      throw new Error(`Failed to find instance for "${this.modelClass().name}"`)
    })
  }

  /**
   * Determine whether the given `result` contains items in the query result.
   *
   * @param result
   *
   * @returns {Boolean}
   */
  protected hasResults (result: any): boolean {
    if (Array.isArray(result)) {
      return result.length > 0
    }

    return !!result
  }
}
