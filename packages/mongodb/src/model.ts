'use strict'

import pluralize from 'pluralize'
import { isObject } from './utils'
import Str from '@supercharge/strings'
import { QueryBuilder } from './query/builder'
import { MoonModel } from './contracts/model-contract'
import { ModelObject } from './contracts/utils-contract'
import { MoonDocument } from './contracts/document-contract'
import { MongodbConnection, MongodbConnectionResolver } from './contracts/connection-contract'
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
    return this
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
   * Creates and returns a new document instance for this model.
   *
   * @param attributes
   */
  newInstance<T extends MoonDocument> (attributes?: ModelObject): T {
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
   * Returns the collection name.
   */
  static async all<T extends MoonModel>(this: T): Promise<Array<InstanceType<T>>> {
    return await this.find()
  }

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  static async find<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): Promise<Array<InstanceType<T>>> {
    return await this.query().where(filter as InstanceType<T>).find(options) as Array<InstanceType<T>>
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  static async findOne<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): Promise<InstanceType<T> | undefined> {
    return await this.query().where(filter as InstanceType<T>).findOne(options) as InstanceType<T>
  }

  /**
   * Tba.
   */
  static async findById<T extends MoonModel>(this: T, id: ObjectId | string, options?: FindOptions<InstanceType<T>>): Promise<InstanceType<T> | undefined> {
    return await this.findOne(
      { _id: new ObjectId(id) } as any,
      { ...options }
    )
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  static async create<T extends MoonModel>(this: T, document: Omit<ModelObject, '_id'>): Promise<InstanceType<T>> {
    return await this.query().create(document) as InstanceType<T>
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  static async updateOne<T extends MoonModel>(this: T, filter: Filter<InstanceType<T>>, update: UpdateFilter<InstanceType<T>>): Promise<InstanceType<T>> {
    return await this.query().updateOne(filter as InstanceType<T>, update as any) as InstanceType<T>
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
  static async delete<T extends MoonModel>(this: T, filter: Filter<InstanceType<T>>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.query().delete(filter as InstanceType<T>, options)
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  static async deleteOne<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.query<T>().deleteOne(filter as InstanceType<T>, options)
  }

  /**
   * Eager load the given `relations`.
   */
  static with<T extends MoonModel> (...relations: string[]): QueryBuilder<InstanceType<T>> {
    return this.query<T>().with(...relations)
  }

  /**
   * Returns a query builder instance for this model.
   */
  static query<T extends MoonModel>(): QueryBuilder<InstanceType<T>> {
    return (new this() as unknown as InstanceType<T>).query()
  }

  /**
   * Returns a new query builder for the model’s collection.
   */
  query<T extends MoonDocument> (this: T): QueryBuilder<T> {
    return new QueryBuilder<T>(this)
    // .with(this.with)
  }
}
