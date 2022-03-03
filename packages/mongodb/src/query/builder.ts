'use strict'

import { tap, isNotNullish } from '@supercharge/goodies'
import { MongodbDocument, ModelObject } from '../contracts'
import { Document, Collection, CountDocumentsOptions, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions, WithId } from 'mongodb'

export type OrFailCallback = () => Error

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
   * The callback function used when no documents match a query.
   */
  private orFailCallback?: OrFailCallback

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
    this.filter = Object.assign(this.filter, { ...filter })

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
    this.orFailCallback = handler

    return this
  }

  /**
   * Calls the orFail callback if it’s defined or returns the provided `documents`.
   */
  maybeFail (): void {
    if (this.orFailCallback) {
      throw this.orFailCallback()
    }
  }

  /**
   * Returns a new model instance if the given `document` is not empty.
   */
  createInstanceIfNotNull (values: WithId<Document> | null): T | undefined {
    if (isNotNullish(values)) {
      return this.model.newInstance<T>(values)
    }

    this.maybeFail()
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

    if (results.length === 0) {
      this.maybeFail()
    }

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

    return this.createInstanceIfNotNull(document)
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
   * Creates the given `document` in the database.
   */
  async create (document: ModelObject): Promise<T> {
    return await this.insertOne(document)
  }

  /**
   * Insert the given `document` into the database.
   */
  async insertOne (document: ModelObject): Promise<T> {
    const collection = await this.collection()
    const result = await collection.insertOne(document)

    if (!result.acknowledged) {
      throw new Error('Failed to insert document')
    }

    return this.model.newInstance<T>({ ...document, _id: result.insertedId })
  }

  /**
   * Creates the given `documents` in the database.
   */
  async createMany (documents: ModelObject[]): Promise<void> {
    return await this.insertMany(documents)
  }

  /**
   * Insert the given `documents` into the database.
   */
  async insertMany (documents: ModelObject[]): Promise<void> {
    const collection = await this.collection()
    const result = await collection.insertMany(documents)

    if (!result.acknowledged) {
      throw new Error('Failed to insert documents')
    }
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  async update (filter: Filter<T>, values: UpdateFilter<T>, options?: UpdateOptions): Promise<void> {
    const collection = await this.collection()
    const result = await collection.updateMany({ ...filter }, { ...values } as any, { ...options })

    if (!result.acknowledged) {
      throw new Error('Failed to run "update" query')
    }
  }

  /**
   * Updates the first document matching the given `filter` with the values in `update`.
   */
  async updateOne (filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<void> {
    const collection = await this.collection()
    const result = await collection.updateOne({ ...filter }, { ...update }, { ...options })

    if (!result.acknowledged) {
      throw new Error('Failed to update the document')
    }
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  async delete (filter?: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
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
  async deleteOne (filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
    const collection = await this.collection()

    return await collection.deleteOne({ ...filter }, { ...options })
  }

  /**
   * Deletes a document for the given `id`. Returns `undefined` if no document is available.
   */
  async deleteById (id: ObjectId | string, options?: DeleteOptions): Promise<void> {
    await this.deleteOne({ _id: new ObjectId(id) } as unknown as Filter<T>, { ...options })
  }

  /**
   * Returns the number of documents in the model’s collection.
   */
  async count (filter?: Filter<T>, options?: CountDocumentsOptions): Promise<number> {
    const collection = await this.collection()

    return collection.countDocuments({ ...filter }, { ...options })
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
