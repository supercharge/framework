'use strict'

import { QueryBuilder, QueryOptions } from './builder'
import { MongodbDocument, QueryBuilderContract } from '../contracts'
import { AggregationBuilder } from './aggregate-builder'
import { AggregateBuilderCallback, AggregatePipeline, AggregatePipelineSortDirection } from '../contracts/aggregation-builder-contract'
import { AggregateOptions, CountDocumentsOptions, DeleteOptions, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export type OrFailCallback = () => Error
export type QueryMethod = 'find' | 'findById' | 'findOne' | 'update' | 'updateOne' | 'delete' | 'deleteById' | 'deleteOne' | 'count' | 'with' | 'aggregate'

export class PendingQuery<T extends MongodbDocument, ResultType = T> implements QueryBuilderContract<T, ResultType> {
  /**
   * The query builder instance.
   */
  private readonly queryBuilder: QueryBuilder<T>

  /**
   * The method to run.
   */
  private method: QueryMethod

  /**
   * The method to run.
   */
  private values: UpdateFilter<T>

  /**
   * Create a new document instance for this model.
   */
  constructor (queryBuilder: QueryBuilder<T>) {
    this.values = {}
    this.method = 'find'
    this.queryBuilder = queryBuilder
  }

  /**
   * Required when promises are extended.
   */
  get [Symbol.toStringTag] (): string {
    return this.constructor.name
  }

  /**
   * Assign the given `method`
   *
   * @param relations
   *
   * @returns {this}
   */
  withMethod (method: QueryMethod): this {
    this.method = method

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  withOptions (options?: QueryOptions): this {
    this.queryBuilder.withOptions(options)

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  withAggregation (pipeline: AggregatePipeline): this {
    this.queryBuilder.withAggregation(pipeline)

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  with (...relations: string[]): this {
    this.queryBuilder.with(...relations)

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  where (filter?: Filter<T>): this {
    this.queryBuilder.where(filter)

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  orFail (handler: () => Error): this {
    this.queryBuilder.orFail(handler)

    return this
  }

  /**
   * Add a descending "order by" sorting to the query.
   */
  latest (): this {
    return this.sort('_id', 'desc')
  }

  /**
   * Add an ascending "order by" sorting to the query.
   */
  oldest (): this {
    return this.sort('_id', 'asc')
  }

  /**
   * Sort the result by the given `columns`.
   */
  sort (columns: Record<string, AggregatePipelineSortDirection>): this
  sort (column: string, direction?: AggregatePipelineSortDirection): this
  sort (column: string | Record<string, AggregatePipelineSortDirection>, direction?: AggregatePipelineSortDirection): this {
    if (typeof column === 'string') {
      return this.aggregate(builder => {
        builder.sort({ [column]: this.sortDirection(direction) })
      })
    }

    const sorting = Object
      .entries(column)
      .reduce<Record<string, 1 | -1>>((sorting, [column, direction]) => {
      sorting[column] = this.sortDirection(direction)

      return sorting
    }, {})

    return this.aggregate(builder => {
      builder.sort(sorting)
    })
  }

  /**
   * Returns the resolved sort direction. MongoDB expects the sort direction to
   * be an integer. The integer value `1` represents an ascending sort order
   * whereas `-1` represents a descending sort order. This gets resolved.
   */
  private sortDirection (direction: AggregatePipelineSortDirection = 'asc'): -1 | 1 {
    switch (direction) {
      case 'asc':
      case 'ascending':
        return 1

      case 'desc':
      case 'descending':
        return -1

      default:
        return direction
    }
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find (filter?: Filter<T>, options?: FindOptions<T>): this {
    this
      .withMethod('find')
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  findOne (filter?: Filter<T>, options?: FindOptions<T>): this {
    this
      .withMethod('findOne')
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Find a document for the given `id`. Returns `undefined` if no document is available.
   */
  findById (id: ObjectId | string, options?: FindOptions<T>): this {
    this
      .withMethod('findById')
      .withOptions(options)
      .where({ _id: new ObjectId(id) } as unknown as Filter<T>)

    return this
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  update (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.values = values
    this.withMethod('update').withOptions(options)

    return this
  }

  /**
   * Updates the first document matching the given `filter` with the values in `update`.
   */
  updateOne (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.values = values
    this.withMethod('updateOne').withOptions(options)

    return this
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  truncate (options?: DeleteOptions): this {
    return this.delete({}, options)
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  delete (filter?: Filter<T>, options?: DeleteOptions): this {
    this.withMethod('delete').where(filter).withOptions(options)

    return this
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne (filter?: Filter<T>, options?: DeleteOptions): this {
    this.withMethod('deleteOne').where(filter).withOptions(options)

    return this
  }

  /**
   * Deletes a document for the given `id`. Returns `undefined` if no document is available.
   */
  deleteById (id: ObjectId | string, options?: DeleteOptions): this {
    return this.deleteOne({ _id: new ObjectId(id) } as unknown as Filter<T>, options)
  }

  /**
   * Returns the number of documents in the model’s collection.
   */
  count (filter?: Filter<T>, options?: CountDocumentsOptions): this {
    this.withMethod('count').where(filter).withOptions(options)

    return this
  }

  /**
   * Returns an aggregate query. Use the aggregate `builder` to customize the query.
   */
  aggregate (callback: AggregateBuilderCallback, options?: AggregateOptions): this {
    if (typeof callback !== 'function') {
      throw new Error('You must provide a callback function as the first argument when calling Model.aggregate')
    }

    const aggregationBuilder = new AggregationBuilder()
    callback(aggregationBuilder)

    this
      .withMethod('aggregate')
      .withOptions(options)
      .withAggregation(aggregationBuilder.pipeline())

    return this
  }

  /**
   * Run the query.
   */
  async get (): Promise<any> {
    return await (this.queryBuilder[this.method] as unknown as Function)(this.values)
  }

  /**
   * Implementation of the promise `then` method.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  // then (onFulfilled: (value: unknown) => ResultType | PromiseLike<ResultType>, onRejected?: any): Promise<ResultType> {
  then (onFulfilled: any, onRejected?: any): any {
    return this.get().then(onFulfilled, onRejected)
  }

  /**
   * Implementation of the promise `catch` method.
   */
  catch (onRejected: any): any {
    return this.get().catch(onRejected)
  }

  /**
   * Implementation of the promise `finally` method.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  finally (onFinally: any): any {
    return this.get().finally(onFinally)
  }
}
