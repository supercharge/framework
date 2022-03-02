'use strict'

import { tap } from '@supercharge/goodies'
import { MongodbDocument, ModelObject } from '../contracts'
import { Collection, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter } from 'mongodb'

export class QueryBuilder<T extends MongodbDocument> {
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
    return tap(this, () => {
      this.eagerLoad.push(...relations)
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
    return tap(this, () => {
      this.filter = { ...filter }
    })
  }

  /**
   * Returns the MongoDB collection for the related model.
   */
  async collection (): Promise<Collection> {
    return this.model.getCollection()
  }

  /**
   * Save this document in the database.
   */
  async save (document: Partial<MongodbDocument>): Promise<T> {
    const { _id, ...values } = document
    const collection = await this.collection()

    return await tap(document, async () => {
      await collection.updateOne({ _id }, { $set: { ...values } })
    }) as T
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  async find (options?: FindOptions<T>): Promise<T[]> {
    const collection = await this.collection()
    const results = await collection.find({ ...this.filter }, { ...options }).toArray()

    return results.map(result => {
      return this.model.newInstance<T>(result)
    })
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  async findOne (options?: FindOptions<T>): Promise<T | undefined> {
    const collection = await this.collection()
    const document = await collection.findOne({ ...this.filter }, { ...options })

    if (document) {
      return this.model.newInstance<T>(document)
    }
  }

  /**
   * Find a document for the given `id`. Returns `undefined` if no document is available.
   */
  async findById (id: ObjectId | string, options?: FindOptions<T>): Promise<T | undefined> {
    return await this
      .where({ _id: new ObjectId(id) } as unknown as Filter<T>)
      .findOne({ ...options })
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  async create (document: Omit<ModelObject, '_id'>): Promise<T> {
    const collection = await this.collection()
    const result = await collection.insertOne(document)

    if (!result.acknowledged) {
      throw new Error('Failed to insert document')
    }

    // return await this.findById(result.insertedId) as T
    return this.model.newInstance<T>({ ...document, _id: result.insertedId })
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  async updateOne (filter: Filter<T>, update: UpdateFilter<T>): Promise<T> {
    const collection = await this.collection()
    const result = await collection.updateOne({ ...filter }, { ...update })

    if (!result.acknowledged) {
      throw new Error('Failed to update document')
    }

    return await this.findById(result.upsertedId) as T
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  async delete (filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
    const collection = await this.collection()
    const result = await collection.deleteMany({ ...filter }, { ...options })

    if (!result.acknowledged) {
      throw new Error('Failed to delete documents')
    }

    return result
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  async deleteOne (filter?: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
    const collection = await this.collection()

    return await collection.deleteOne({ ...filter }, { ...options })
  }

  /**
   * Run the query.
   */
  async run (): Promise<any[]> {
    return await this.find()
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
