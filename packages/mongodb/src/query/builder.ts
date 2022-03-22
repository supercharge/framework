'use strict'

import Str from '@supercharge/strings'
import { Arr } from '@supercharge/arrays'
import { QueryProcessor } from './processor'
import { ModelObject, MongodbDocument, MongodbModel, QueryBuilderContract, QueryOptions } from '../contracts'
import { AggregateBuilderCallback, AggregatePipelineSortDirection } from '../contracts/aggregation-builder-contract'
import { AggregateOptions, CountDocumentsOptions, DeleteOptions, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export type QueryMethod = 'find' | 'findById' | 'findOne' | 'update' | 'updateOne' | 'delete' | 'deleteById' | 'deleteOne' | 'count' | 'with' | 'aggregate' | 'insertOne' | 'insertMany'

export class QueryBuilder<T extends MongodbDocument, ResultType = T> implements QueryBuilderContract<T, ResultType> {
  /**
   * The query builder instance.
   */
  private readonly queryProcessor: QueryProcessor<T>

  /**
   * The method to run.
   */
  private method: QueryMethod

  /**
   * The method to run.
   */
  private values: UpdateFilter<T>

  /**
   * Create a new instance.
   */
  constructor (processor: QueryProcessor<T>) {
    this.values = {}
    this.method = 'find'
    this.queryProcessor = processor
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
    this.queryProcessor.withOptions(options)

    return this
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  withAggregation (callback: AggregateBuilderCallback): this {
    this.queryProcessor.withAggregationFrom(callback)

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
    this
      .ensureRelationsExist(...relations)
      .createLookupsForRelations(...relations)

    return this
  }

  /**
   * Ensure the given `relations` are defined on the model.
   *
   * @param relations
   */
  private ensureRelationsExist (...relations: string[]): this {
    Arr.from(relations).forEach(relation => {
      this.queryProcessor.model.ensureRelation(relation)
    })

    return this
  }

  /**
   * Tba.
   *
   * @param relations
   */
  private createLookupsForRelations (...relations: string[]): this {
    relations.forEach(relation => this.createLookupForRelation(relation))

    return this
  }

  /**
   * Tba.
   *
   * @param relations
   */
  private createLookupForRelation (relationName: string): this {
    const relationNames = Str(relationName).split('.')
    const root = relationNames.splice(0, 1)[0]
    const nested = relationNames.join('.')

    const relation = this.queryProcessor.model.resolveRelation(root)

    this.queryProcessor.withAggregationFrom(builder => {
      builder.lookup(lookup => {
        lookup
          .as(root)
          .from(relation.collection)
          .localField(relation.localField)
          .foreignField(relation.foreignField)
          .let({ [relation.foreignField]: '$_id' })
          .pipeline(
            this.createNestedLookup(nested, relation.foreignModelClass)
          )
      })
    })

    this.queryProcessor.with(root)

    return this
  }

  /**
   * Tba.
   */
  private createNestedLookup (relationName: string, ModelClass: MongodbModel): any {
    if (Str(relationName).isEmpty()) {
      return []
    }

    const relationNames = Str(relationName).split('.')
    const root = relationNames.splice(0, 1)[0]
    const nested = relationNames.join('.')

    const relation = new ModelClass().resolveRelation(root)

    return this.queryProcessor.createAggregationPipelineUsing(builder => {
      builder.lookup(lookup => {
        lookup
          .as(root)
          .from(relation.collection)
          .localField(relation.localField)
          .foreignField(relation.foreignField)
          .let({ [relation.foreignField]: '$_id' })
          .pipeline(
            this.createNestedLookup(nested, relation.foreignModelClass)
          )
      })
    })
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  where (filter?: Filter<T>): this {
    this.queryProcessor.where(filter)

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
    this.queryProcessor.orFail(handler)

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
   * Sort the result by a given column or an object.
   */
  sort (columns: Record<string, AggregatePipelineSortDirection>): this
  sort (column: string, direction?: AggregatePipelineSortDirection): this
  sort (column: string | Record<string, AggregatePipelineSortDirection>, direction?: AggregatePipelineSortDirection): this {
    return this.aggregate(builder => {
      builder.sort(column, direction)
    })
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find (filter?: Filter<T>, options?: FindOptions<T>): this {
    return this
      .withMethod('find')
      .where(filter)
      .withOptions(options)
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  findOne (filter?: Filter<T>, options?: FindOptions<T>): this {
    return this
      .withMethod('findOne')
      .where(filter)
      .withOptions(options)
  }

  /**
   * Find a document for the given `id`. Returns `undefined` if no document is available.
   */
  findById (id: ObjectId | string, options?: FindOptions<T>): this {
    return this
      .withMethod('findById')
      .withOptions(options)
      .where({ _id: id } as unknown as Filter<T>)
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  insertOne (document: ModelObject): this {
    this.values = document

    return this.withMethod('insertOne')
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  insertMany (documents: ModelObject[]): this {
    this.values = documents

    return this.withMethod('insertMany')
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  update (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.values = values

    return this.withMethod('update').withOptions(options)
  }

  /**
   * Updates the first document matching the given `filter` with the values in `update`.
   */
  updateOne (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.values = values

    return this.withMethod('updateOne').withOptions(options)
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
    return this
      .where(filter)
      .withMethod('delete')
      .withOptions(options)
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne (filter?: Filter<T>, options?: DeleteOptions): this {
    return this
      .where(filter)
      .withMethod('deleteOne')
      .withOptions(options)
  }

  /**
   * Deletes a document for the given `id`. Returns `undefined` if no document is available.
   */
  deleteById (id: ObjectId | string, options?: DeleteOptions): this {
    return this.deleteOne({ _id: id } as unknown as Filter<T>, options)
  }

  /**
   * Returns the number of documents in the model’s collection.
   */
  count (filter?: Filter<T>, options?: CountDocumentsOptions): this {
    return this
      .where(filter)
      .withMethod('count')
      .withOptions(options)
  }

  /**
   * Returns an aggregate query. Use the aggregate `builder` to customize the query.
   */
  aggregate (callback: AggregateBuilderCallback, options?: AggregateOptions): this {
    if (typeof callback !== 'function') {
      throw new Error('You must provide a callback function as the first argument when calling Model.aggregate')
    }

    return this
      .withMethod('aggregate')
      .withOptions(options)
      .withAggregation(callback)
  }

  /**
   * Run the query.
   */
  async get (): Promise<any> {
    return await (this.queryProcessor[this.method] as unknown as Function)(this.values)
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
