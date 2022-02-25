'use strict'

import { MoonModel } from '../contracts'
import { Filter, FindOptions } from 'mongodb'

export class QueryBuilder<T extends MoonModel> {
  /**
   * The model being queried.
   */
  private readonly model: T

  /**
   * The query filter.
   */
  private filter: Filter<T>

  /**
   * The relationships that should be eager loaded.
   */
  private readonly eagerLoad: string[]

  /**
   * Create a new document instance for this model.
   */
  constructor (model: T) {
    this.model = model

    this.filter = {}
    this.eagerLoad = []
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
    this.eagerLoad.push(...relations)

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
    this.filter = { ...filter }

    return this
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  async find (options?: FindOptions<T>): Promise<Array<InstanceType<T>>> {
    const results = await this.model.collection().find({ ...this.filter }, { ...options }).toArray()
    const Ctor = this.model

    return results.map(result => {
      return new Ctor(result).withDatabase(this.model.database)
    }) as Array<InstanceType<T>>
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  async findOne (options?: FindOptions<T>): Promise<InstanceType<T> | undefined> {
    const document = await this.model.collection().findOne({ ...this.filter }, { ...options })

    if (document) {
      const Ctor = this.model
      return new Ctor(document).withDatabase(this.model.database) as InstanceType<T>
    }
  }

  /**
   * Run the query.
   */
  async run (): Promise<any[]> {
    return this.find()
  }

  /**
   * Implementation of the promise `then` method.
   */
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
  finally (onFinally: any): any {
    return this.run().finally(onFinally)
  }
}
