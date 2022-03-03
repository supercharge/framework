'use strict'

import { tap, isNotNullish } from '@supercharge/goodies'
import { MongodbDocument, ModelObject } from '../contracts'
import { Document, Collection, DeleteOptions, DeleteResult, Filter, FindOptions, UpdateFilter, UpdateOptions, WithId, CountDocumentsOptions } from 'mongodb'

export type OrFailCallback = () => Error
export type QueryOptions = FindOptions | UpdateOptions | DeleteOptions | CountDocumentsOptions

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
   * The query options.
   */
  private options: QueryOptions

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
    this.options = {}
    this.eagerLoad = []
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
      this.filter = Object.assign(this.filter, { ...filter })
    })
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  withOptions (options?: QueryOptions): this {
    return tap(this, () => {
      this.options = Object.assign(this.options, { ...options })
    })
  }

  /**
   * Eager load the given `relations`.
   *
   * @param relations
   *
   * @returns {this}
   */
  orFail (handler: () => Error): this {
    return tap(this, () => {
      this.orFailCallback = handler
    })
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
  async find (): Promise<T[]> {
    const collection = await this.collection()
    const results = await collection.find({ ...this.filter }, { ...this.options }).toArray()

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
  async findOne (): Promise<T | undefined> {
    const collection = await this.collection()
    const document = await collection.findOne({ ...this.filter }, { ...this.options })

    return this.createInstanceIfNotNull(document)
  }

  /**
   * Find a document for the given `id`. Returns `undefined` if no document is available.
   */
  async findById (): Promise<T | undefined> {
    return await this.findOne()
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
  async update (values: UpdateFilter<T>): Promise<void> {
    const collection = await this.collection()
    const result = await collection.updateMany({ ...this.filter }, { ...values } as any, { ...this.options })

    if (!result.acknowledged) {
      throw new Error('Failed to run "update" query')
    }
  }

  /**
   * Updates the first document matching the given `filter` with the values in `update`.
   */
  async updateOne (values: UpdateFilter<T>): Promise<void> {
    const collection = await this.collection()
    const result = await collection.updateOne({ ...this.filter }, { ...values }, { ...this.options })

    if (!result.acknowledged) {
      throw new Error('Failed to update the document')
    }
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  async delete (): Promise<DeleteResult> {
    const collection = await this.collection()
    const result = await collection.deleteMany({ ...this.filter }, { ...this.options })

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
  async deleteOne (): Promise<DeleteResult> {
    const collection = await this.collection()

    return await collection.deleteOne({ ...this.filter }, { ...this.options })
  }

  /**
   * Deletes a document for the given `id`. Returns `undefined` if no document is available.
   */
  async deleteById (): Promise<void> {
    await this.deleteOne()
  }

  /**
   * Returns the number of documents in the model’s collection.
   */
  async count (): Promise<number> {
    const collection = await this.collection()

    return collection.countDocuments({ ...this.filter }, { ...this.options })
  }
}
