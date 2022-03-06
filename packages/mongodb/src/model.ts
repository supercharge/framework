'use strict'

import pluralize from 'pluralize'
import { isObject } from './utils'
import Str from '@supercharge/strings'
import { QueryBuilder } from './query/builder'
import { PendingQuery } from './query/pending'
import { ModelObject } from './contracts/utils-contract'
import { MongodbModel } from './contracts/model-contract'
import { MongodbDocument } from './contracts/document-contract'
import { QueryBuilderContract } from './contracts/query-builder-contract'
import { AggregateBuilderCallback } from './contracts/aggregate-builder-contract'
import { MongodbConnection, MongodbConnectionResolver } from './contracts/connection-contract'
import { AggregateOptions, Collection, CountDocumentsOptions, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

function StaticImplements<T> () {
  return (_t: T) => {}
}

@StaticImplements<MongodbModel>()
export class Model implements MongodbDocument {
  /**
   * Stores the document ID.
   */
  public _id!: ObjectId

  /**
   * Stores the connection reference.
   */
  static connection: string

  /**
   * Stores connection resolver.
   */
  protected static connectionResolver: MongodbConnectionResolver

  // /**
  //  * Stores relations to other models.
  //  */
  // static relations: Lookup[]

  /**
   * Create a new document instance for this model.
   */
  constructor (values?: ModelObject) {
    this.fill(values ?? {})
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
    return this.toObject()
  }

  /**
   * Returns a plain JavaScript object.
   */
  toObject<T = ModelObject> (): T {
    return { ...this } as unknown as T
  }

  /**
   * Assign the database connection resolve.
   *
   * @param {Connection} resolver
   */
  static setConnectionResolver (resolver: MongodbConnectionResolver): typeof Model {
    this.connectionResolver = resolver

    return this
  }

  /**
   * Assign the database connection resolve.
   *
   * @param {Connection} resolver
   */
  setConnectionResolver (resolver: MongodbConnectionResolver): this {
    this.model().setConnectionResolver(resolver)

    return this
  }

  /**
   * Returns the connection resolver instance.
   */
  static getConnectionResolver (): MongodbConnectionResolver {
    return this.connectionResolver
  }

  /**
   * Returns the connection resolver instance.
   */
  getConnectionResolver (): MongodbConnectionResolver {
    return this.model().getConnectionResolver()
  }

  /**
   * Resolve and return a connection instance.
   *
   * @param  {String|undefined} connection
   *
   * @return {MongodbConnection}
   */
  static async resolveConnection (connection?: string): Promise<MongodbConnection> {
    return await this.getConnectionResolver().connection(connection)
  }

  /**
   * Returns the database connection for the model.
   *
   * @return {MongodbConnection}
   */
  async getConnection (): Promise<MongodbConnection> {
    return await this.model().resolveConnection(
      this.model().connection
    )
  }

  /**
   * Returns the collection name.
   */
  static get collection (): string {
    return Str(
      pluralize(this.name)
    ).snake().lower().get()
  }

  /**
   * Returns the database connection for the model.
   */
  async getCollection (): Promise<Collection> {
    const connection = await this.getConnection()

    return connection.db().collection(
      this.model().collection
    )
  }

  /**
   * Save this document in the database.
   */
  async save (): Promise<this> {
    return await this.query().save(this)
  }

  /**
   * Update this document in the database.
   */
  async update ({ _id, ...values }: ModelObject): Promise<this> {
    return await this.fill({ ...values }).save()
  }

  /**
   * Delete this document from the database.
   */
  async delete (): Promise<this> {
    await (this.pendingQuery().deleteById(this._id) as any)

    return this
  }

  /**
   * Returns the model constructor.
   */
  private model (): MongodbModel {
    return this.constructor as MongodbModel
  }

  /**
   * Creates and returns a new document instance for this model.
   *
   * @param attributes
   */
  newInstance<T extends MongodbDocument> (attributes?: ModelObject): T {
    const Ctor = this.model()

    return new Ctor(attributes).setConnectionResolver(
      this.getConnectionResolver()
    ) as T
  }

  /**
   * Assign the given `values` to the document.
   */
  fill (values: ModelObject): this {
    return this.merge(values)
  }

  /**
    * Merge the given `values` into the document.
    */
  merge (values: ModelObject): this {
    if (isObject(values)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.assign(this, { ...values })
    }

    return this
  }

  /**
   * This method is an alias for `.find()` returning all documents matching the given `filters`.
   */
  static all<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T> | undefined>> {
    return this.find(filter, options)
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  static find<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T>>> {
    return this.pendingQuery<T>().find(filter, options)
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  static findOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined> {
    return this.pendingQuery<T>().findOne(filter, options)
  }

  /**
   * Tba.
   */
  static findById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined> {
    return this.pendingQuery<T>().findById(id, options)
  }

  /**
   * Creates the given `document` in the database.
   */
  static async create<T extends MongodbModel>(this: T, document: ModelObject): Promise<InstanceType<T>> {
    return await this.query().create(document) as InstanceType<T>
  }

  /**
   * Creates the given `documents` in the database.
   */
  static async createMany<T extends MongodbModel>(this: T, documents: ModelObject[]): Promise<void> {
    return await this.query().createMany(documents)
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  static update<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options: UpdateOptions): QueryBuilderContract<InstanceType<T>, void> {
    return this.pendingQuery<T>().update(values as any, options)
  }

  /**
   * Updates the first document maching the given `filter` with values from `update`.
   */
  static updateOne<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options?: UpdateOptions): QueryBuilderContract<InstanceType<T>> {
    return this.pendingQuery<T>().updateOne(values, options)
  }

  /**
   * Deletes all documents in the collection.
   */
  static truncate<T extends MongodbModel>(this: T, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult> {
    return this.delete({}, options)
  }

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  static delete<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult> {
    return this.pendingQuery().where(filter as any).delete(options) as PendingQuery<InstanceType<T>>
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  static deleteOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult> {
    return this.pendingQuery<T>().deleteOne(filter, options)
  }

  /**
   * Delete the document for the given `id`. Does nothing if no document with that ID is available.
   */
  static deleteById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, void> {
    return this.pendingQuery<T>().deleteOne({ _id: new ObjectId(id) } as any, options)
  }

  /**
   * Eager load the given `relations`.
   */
  static count<T extends MongodbModel> (this: T, filter?: Filter<InstanceType<T>>, options?: CountDocumentsOptions): QueryBuilderContract<InstanceType<T>, number> {
    return this.pendingQuery<T>().count(filter, options)
  }

  /**
   * Eager load the given `relations`.
   */
  static with<T extends MongodbModel> (...relations: string[]): QueryBuilder<InstanceType<T>> {
    return this.query<T>().with(...relations)
  }

  /**
   * Returns a query builder instance containing the given `filter`.
   */
  static where<T extends MongodbModel>(this: T, filter: Filter<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T>>> {
    return this.pendingQuery<T>().where(filter)
  }

  /**
   * Returns a pending query instance for this model.
   */
  static pendingQuery<T extends MongodbModel, ReturnType = any>(): PendingQuery<InstanceType<T>, ReturnType> {
    return (new this() as unknown as InstanceType<T>).pendingQuery<InstanceType<T>, ReturnType>()
  }

  /**
   * Returns a pending query instance for this model.
   */
  pendingQuery<T extends MongodbDocument, ReturnType = any>(this: T): PendingQuery<T, ReturnType> {
    return new PendingQuery<T, ReturnType>(
      this.query<T>()
    )
  }

  /**
   * Returns a query builder instance for this model.
   */
  static query<T extends MongodbModel>(): QueryBuilder<InstanceType<T>> {
    return (new this() as unknown as InstanceType<T>).query()
  }

  /**
   * Returns a new query builder for the model’s collection.
   */
  query<T extends MongodbDocument> (this: T): QueryBuilder<T> {
    return new QueryBuilder<T>(this)
  }

  /**
   * Returns an aggregate query. Use the aggregate `builder` to customize the query.
   */
  static aggregate<T extends MongodbModel, ResultType = Array<InstanceType<T>>>(this: T, callback: AggregateBuilderCallback, options?: AggregateOptions): QueryBuilderContract<InstanceType<T>, ResultType> {
    if (typeof callback !== 'function') {
      throw new Error(`You must provide a function as the first argument when calling ${this.name}.aggregate`)
    }

    return this.pendingQuery<T>().aggregate(callback, options)
  }
}
