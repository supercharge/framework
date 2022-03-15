'use strict'

import { tap, isNotNullish } from '@supercharge/goodies'
import { AggregationBuilder } from './aggregation-builder'
import { Document, Collection, DeleteResult, Filter, UpdateFilter, WithId } from 'mongodb'
import { MongodbDocument, ModelObject, AggregatePipeline, QueryOptions, OrFailCallback, AggregateBuilderCallback } from '../contracts'

export class QueryProcessor<T extends MongodbDocument> {
  /**
   * The model being queried.
   */
  public readonly model: T

  /**
   * The query filter.
   */
  private filter: Filter<T>

  /**
   * The query options.
   */
  private options: QueryOptions

  /**
   * The query options.
   */
  private readonly aggregationPipeline: AggregatePipeline

  /**
   * The relationships that should be eager loaded.
   */
  private readonly eagerLoads: string[]

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
    this.eagerLoads = []
    this.aggregationPipeline = []
  }

  /**
   * Eager load the given `relations` when searching for documents.
   *
   * @param relations
   *
   * @returns {this}
   */
  with (...relations: string[]): this {
    return tap(this, () => {
      this.eagerLoads.push(...relations)
    })
  }

  /**
   * Determine whether eager loads are configured for this query.
   *
   * @returns {this}
   */
  shouldEagerload (): boolean {
    return this.eagerLoads.length > 0
  }

  /**
   * Assign the given `filter` to the query.
   *
   * @param filter
   *
   * @returns {this}
   */
  where (filter?: Filter<T>): this {
    return tap(this, () => {
      this.filter = Object.assign(this.filter, { ...filter })
    })
  }

  /**
   * Assign the given `options` to the query.
   *
   * @param options
   *
   * @returns {this}
   */
  withOptions (options?: QueryOptions): this {
    return tap(this, () => {
      this.options = Object.assign(this.options, { ...options })
    })
  }

  /**
   * Assign the given aggregation `pipeline` to the query.
   *
   * @param pipeline
   *
   * @returns {this}
   */
  withAggregationFrom (callback: AggregateBuilderCallback): this {
    const aggregationBuilder = new AggregationBuilder()
    callback(aggregationBuilder)

    return this.withAggregation(
      aggregationBuilder.pipeline()
    )
  }

  /**
   * Assign the given aggregation `pipeline` to the query.
   *
   * @param pipeline
   *
   * @returns {this}
   */
  withAggregation (pipeline: AggregatePipeline): this {
    return tap(this, () => {
      this.aggregationPipeline.push(...pipeline)
    })
  }

  /**
   * Assign the given orFail `handler` to the query.
   *
   * @param handler
   *
   * @returns {this}
   */
  orFail (handler: () => Error): this {
    if (typeof handler !== 'function') {
      throw new Error('The orFail method requires a callback function as a parameter.')
    }

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
   * Returns new model instances  the given `document` is not empty.
   */
  createInstancesOrFailIfEmpty (documents: Array<WithId<Document>>): T[] {
    if (documents.length === 0) {
      this.maybeFail()
    }

    return documents.map(document => {
      return this.createInstance(document)
    })
  }

  /**
   * Returns a new model instance if the given `document` is not empty.
   */
  createInstanceIfNotNull (values: WithId<Document> | null): T | undefined {
    if (isNotNullish(values)) {
      return this.createInstance(values)
    }

    this.maybeFail()
  }

  /**
   * Returns a new model instance if the given `document` is not empty.
   */
  createInstance (document: WithId<Document>): T {
    return this.model.newInstance<T>(document)
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
    const documents = await collection.find({ ...this.filter }, { ...this.options }).toArray()

    return this.createInstancesOrFailIfEmpty(documents)
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  async findOne (): Promise<T | undefined> {
    const collection = await this.collection()

    // TODO check for eagerloads
    if (this.shouldEagerload()) {
      this.withAggregationFrom(builder => {
        builder.match({ ...this.filter })
      })

      this.eagerLoads.forEach(relation => {
        this.withAggregationFrom(builder => {
          builder.unwind(builder => builder.path(relation))
        })
      })

      const result = await this.aggregate()

      return this.createInstanceIfNotNull(result[0] as WithId<T>)
    }

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

    return this.createInstance({ ...document, _id: result.insertedId })
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

  /**
   * Creates the given `documents` in the database.
   */
  async aggregate (): Promise<T[]> {
    const collection = await this.collection()
    const documents = await collection.aggregate<WithId<T>>(this.aggregationPipeline, { ...this.options }).toArray()

    return this.createInstancesOrFailIfEmpty(documents)
  }
}
