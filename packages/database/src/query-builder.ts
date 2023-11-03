
import { Model, Page, QueryBuilder as BaseQueryBuilder } from 'objection'

export class QueryBuilder<M extends Model, R = M[]> extends BaseQueryBuilder<M, R> {
  /**
   * The following properties are necessary to have proper TypeScript support.
   */
  declare ArrayQueryBuilderType: QueryBuilder<M, M[]>
  declare SingleQueryBuilderType: QueryBuilder<M, M>
  declare MaybeSingleQueryBuilderType: QueryBuilder<M, M | undefined>
  declare NumberQueryBuilderType: QueryBuilder<M, number>
  declare PageQueryBuilderType: QueryBuilder<M, Page<M>>

  /**
   * Fails the query if the result set is empty. Use the given `callback` to
   * throw a custom error. Otherwise, this method throws a generic `Error`.
   */
  public orFail (callback?: () => any): QueryBuilder<M, M>['SingleQueryBuilderType'] {
    return this.runAfter((result: any) => {
      if (this.hasResults(result)) {
        return result
      }

      if (typeof callback === 'function') {
        callback()
      }

      throw new Error(`Failed to find instance for "${this.modelClass().name}"`)
    }) as any
  }

  /**
   * Determine whether the given `result` contains items in the query result.
   */
  protected hasResults (result: any): boolean {
    if (Array.isArray(result)) {
      return result.length > 0
    }

    return !!result
  }
}
