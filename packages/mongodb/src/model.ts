'use strict'

import pluralize from 'pluralize'
import { isObject } from './utils'
import { Connection, Lookup } from '.'
import Str from '@supercharge/strings'
import { Arr } from '@supercharge/arrays'
import { QueryBuilder } from './query/builder'
import { MoonModel } from './contracts/model-contract'
import { ModelObject } from './contracts/utils-contract'
import { MoonDocument } from './contracts/document-contract'
import { Collection, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter } from 'mongodb'

function StaticImplements<T> () {
  return (_t: T) => {}
}

@StaticImplements<MoonModel>()
export class Model implements MoonDocument {
  /**
   * Stores the document ID.
   */
  public _id!: ObjectId

  /**
   * Stores the database reference.
   */
  static database: Connection

  /**
   * Stores relations to other models.
   */
  static relations: Lookup[]

  /**
   * Determine whether this model is booted.
   */
  private static isBooted: boolean = false

  /**
   * Create a new document instance for this model.
   */
  constructor (values?: ModelObject) {
    Object.assign(this, values ?? {})
  }

  /**
   * Returns the document’s ObjectId as a string. Use the
   * `_id` attribute if you need an ObjectId instance.
   *
   * @returns {String}
   */
  get id (): string {
    return String(this._id)
  }

  /**
   * Returns a JSON object.
   */
  toJSON (): ModelObject {
    return this
  }

  /**
   * Boot this model.
   */
  static async boot (): Promise<void> {
    if (this.isBooted) {
      return
    }

    await this.ensureCollection()
    this.markAsBooted()
  }

  /**
   * Mark this model as booted.
   */
  static markAsBooted (): void {
    this.isBooted = true
  }

  /**
   * Create the collection if it doesn’t exist.
   */
  protected static async ensureCollection (): Promise<void> {
    if (await this.database.isMissingCollection(this.collectionName())) {
      await this.database.createCollection(this.collectionName())
    }
  }

  /**
   * Assign the database connection resolve.
   *
   * @param {Connection} database
   */
  static withDatabase (database: Connection): typeof Model {
    this.database = database

    return this
  }

  /**
   * Assign the database connection resolve.
   *
   * @param {Connection} database
   */
  withDatabase (database: Connection): this {
    (this.constructor as typeof Model).withDatabase(database)

    return this
  }

  /**
   * Returns the MongoDB connection.
   */
  static collection (): Collection {
    return this.resolveCollection(
      this.collectionName()
    )
  }

  /**
   * Returns the collection name.
   *
   * @returns {String}
   */
  protected static collectionName (): string {
    return Str(
      pluralize(this.name)
    ).snake().lower().get()
  }

  /**
   * Returns the MongoDB connection.
   *
   * @returns {Db}
   */
  protected static resolveCollection (name: string): Collection {
    return this.database.client().db().collection(name)
  }

  /**
   * Save this document in the database.
   */
  async save (): Promise<this> {
    // await Model.updateOne({ _id: this._id }, this)

    return this
  }

  /**
   * Update this document in the database.
   */
  async update ({ _id, ...values }: ModelObject): Promise<this> {
    await (this.constructor as MoonModel).updateOne({ _id: this._id }, { $set: { ...values } })
    Object.assign(this, values)

    return this
  }

  /**
   * Delete this document from the database.
   */
  async delete (): Promise<this> {
    // TODO

    return this
  }

  /**
   * Returns the model constructor.
   */
  private model (): MoonModel {
    return this.constructor as MoonModel
  }

  /**
   * Load the given `relations` for this document.
   */
  async load (...relations: string[]): Promise<void> {
    this.ensureRelationsAreDefined(...relations)

    // TODO actually load relations
  }

  /**
   * Assign the given `values` to the document.
   */
  private ensureRelationsAreDefined (...relations: string[]): void {
    const missingRelations = Arr
      .from(this.model().relations)
      .map(relation => relation.name)
      .diff(relations)

    if (missingRelations.isNotEmpty()) {
      throw new Error(`Cannot load undefined relationships: ${missingRelations.toArray().join(', ')}`)
    }
  }

  /**
   * Assign the given `values` to the document.
   */
  fill (values: Partial<MoonDocument>): this {
    return this.merge(values)
  }

  /**
    * Merge the given `values` into the document.
    */
  merge (values: Partial<MoonDocument>): this {
    if (isObject(values)) {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, rest } = values
      Object.assign(this, rest)
    }

    return this
  }

  /**
   * Returns the collection name.
   */
  static async all<T extends MoonModel>(this: T): Promise<Array<InstanceType<T>>> {
    return this.find()
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  static async find<T extends MoonModel>(this: T, filter?: Filter<T>, options?: FindOptions<T>): Promise<Array<InstanceType<T>>> {
    return this.query().where(filter).find(options)
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  static async findOne<T extends MoonModel>(this: T, filter?: Filter<T>, options?: FindOptions<T>): Promise<InstanceType<T> | undefined> {
    return this.query().where(filter).findOne(options)
  }

  /**
   * Tba.
   */
  static async findById<T extends MoonModel>(this: T, id: ObjectId | string, options?: FindOptions<T>): Promise<InstanceType<T> | undefined> {
    return await this.findOne(
      { _id: new ObjectId(id) } as unknown as Filter<T>,
      { ...options }
    )
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  static async create<T extends MoonModel>(this: T, document: Omit<T, '_id'>): Promise<InstanceType<T>> {
    const result = await this.collection().insertOne(document)

    if (!result.acknowledged) {
      throw new Error('Failed to insert document')
    }

    return new this({ ...document, _id: result.insertedId }).withDatabase(this.database) as InstanceType<T>
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  static async updateOne<T extends MoonModel>(this: T, filter: Filter<T>, update: UpdateFilter<T>): Promise<InstanceType<T>> {
    const result = await this.collection().updateOne({ ...filter }, { ...update })

    if (!result.acknowledged) {
      throw new Error('Failed to update document')
    }

    return this.findById(result.upsertedId) as InstanceType<T>
  }

  /**
   * Deletes all documents in the collection.
   */
  static async truncate<T extends MoonModel>(this: T, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.delete({}, options)
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  static async delete<T extends MoonModel>(this: T, filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
    const result = await this.collection().deleteMany({ ...filter }, { ...options })

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
  static async deleteOne<T extends MoonModel>(this: T, filter?: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.collection().deleteOne({ ...filter }, { ...options })
  }

  /**
   * Returns a query builder instance for this model.
   */
  static query<T extends MoonModel>(this: T): QueryBuilder<T> {
    return new QueryBuilder(this)
  }

  /**
   * Eager load the given `relations`.
   */
  static with<T extends MoonModel> (this: T, ...relations: string[]): QueryBuilder<T> {
    return this.query().with(...relations)
  }
}
