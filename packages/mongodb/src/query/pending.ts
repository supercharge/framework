'use strict'

import { QueryBuilder } from './builder'
import { MongodbDocument, QueryBuilderContract } from '../contracts'
import { CountDocumentsOptions, DeleteOptions, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export type OrFailCallback = () => Error
export type QueryMethod = 'find' | 'findById' | 'findOne' | 'update' | 'updateOne' | 'delete' | 'deleteById' | 'deleteOne' | 'count' | 'with'

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
    this.method = 'find'
    this.values = {}
    this.queryBuilder = queryBuilder
  }

  /**
   * Required when promises are extended.
   */
  get [Symbol.toStringTag] (): string {
    return this.constructor.name
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
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find (filter?: Filter<T>, options?: FindOptions<T>): this {
    this.method = 'find'
    this.queryBuilder
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  findOne (filter?: Filter<T>, options?: FindOptions<T>): this {
    this.method = 'findOne'
    this.queryBuilder
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Find a document for the given `id`. Returns `undefined` if no document is available.
   */
  findById (id: ObjectId | string, options?: FindOptions<T>): this {
    this.method = 'findById'
    this.queryBuilder
      .withOptions(options)
      .where({ _id: new ObjectId(id) } as unknown as Filter<T>)

    return this
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  update (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.method = 'update'
    this.values = values
    this.queryBuilder.withOptions(options)

    return this
  }

  /**
   * Updates the first document matching the given `filter` with the values in `update`.
   */
  updateOne (values: UpdateFilter<T>, options?: UpdateOptions): this {
    this.method = 'updateOne'
    this.values = values
    this.queryBuilder.withOptions(options)

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
    this.method = 'delete'
    this.queryBuilder
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne (filter?: Filter<T>, options?: DeleteOptions): this {
    this.method = 'deleteOne'
    this.queryBuilder
      .where(filter)
      .withOptions(options)

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
    this.method = 'count'
    this.queryBuilder
      .where(filter)
      .withOptions(options)

    return this
  }

  /**
   * Run the query.
   */
  async run (): Promise<any> {
    return await (this.queryBuilder[this.method] as unknown as Function)(this.values)
  }

  /**
   * Implementation of the promise `then` method.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  then (onFulfilled: any, onRejected?: any): any {
    return this.run().then(onFulfilled, onRejected)
  }

  /**
   * Implementation of the promise `catch` method.
   */
  catch (onRejected: any): any {
    return this.run().catch(onRejected)
  }

  /**
   * Implementation of the promise `finally` method.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  finally (onFinally: any): any {
    return this.run().finally(onFinally)
  }
}
