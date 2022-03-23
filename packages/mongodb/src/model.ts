'use strict'

import pluralize from 'pluralize'
import { isObject } from './utils'
import Str from '@supercharge/strings'
import { QueryBuilder } from './query/builder'
import { isNullish } from '@supercharge/goodies'
import { QueryProcessor } from './query/processor'
import { ModelObject } from './contracts/utils-contract'
import { MongodbModel } from './contracts/model-contract'
import { MongodbDocument } from './contracts/document-contract'
import { RelationBuilder, HasOneRelationBuilder } from './relations'
import { QueryBuilderContract } from './contracts/query-builder-contract'
import { AggregateBuilderCallback } from './contracts/aggregation-builder-contract'
import { MongodbConnection, MongodbConnectionResolver } from './contracts/connection-contract'
import { RelationMappings, RelationBuilderContract, Relation } from './contracts/relations-contract'
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

  /**
   * Stores relations to other models.
   */
  static relations: RelationMappings = {}

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
    await this.queryProcessor().save(this)

    return this
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
    await (this.query().deleteById(this._id) as any)

    return this
  }

  /**
   * Returns the model constructor.
   */
  model<T extends MongodbModel> (): T {
    return this.constructor as T
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
    return this.query<T>().find(filter, options)
  }

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns `undefined` if no document was found in the collection.
   */
  static findOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined> {
    return this.query<T>().findOne(filter, options)
  }

  /**
   * Tba.
   */
  static findById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined> {
    return this.query<T>().findById(id, options)
  }

  /**
   * Creates the given `document` in the database.
   */
  static async create<T extends MongodbModel>(this: T, document: ModelObject): Promise<InstanceType<T>> {
    return await this.query().insertOne(document).get()
  }

  /**
   * Creates the given `documents` in the database.
   */
  static async createMany<T extends MongodbModel>(this: T, documents: ModelObject[]): Promise<void> {
    await this.query().insertMany(documents).get()
  }

  /**
   * Updates all documents maching the given `filter` with values from `update`.
   */
  static update<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options: UpdateOptions): QueryBuilderContract<InstanceType<T>, void> {
    return this.query<T>().update(values as any, options)
  }

  /**
   * Updates the first document maching the given `filter` with values from `update`.
   */
  static updateOne<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options?: UpdateOptions): QueryBuilderContract<InstanceType<T>> {
    return this.query<T>().updateOne(values, options)
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
    return this.query().where(filter as any).delete(options) as QueryBuilder<InstanceType<T>>
  }

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  static deleteOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult> {
    return this.query<T>().deleteOne(filter, options)
  }

  /**
   * Delete the document for the given `id`. Does nothing if no document with that ID is available.
   */
  static deleteById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, void> {
    return this.query<T>().deleteOne({ _id: id } as any, options)
  }

  /**
   * Eager load the given `relations`.
   */
  static count<T extends MongodbModel> (this: T, filter?: Filter<InstanceType<T>>, options?: CountDocumentsOptions): QueryBuilderContract<InstanceType<T>, number> {
    return this.query<T>().count(filter, options)
  }

  /**
   * Eager load the given `relations`.
   */
  static with<T extends MongodbModel> (...relations: string[]): QueryBuilder<InstanceType<T>, Array<InstanceType<T>>> {
    return this.query<T>().with(...relations)
  }

  /**
   * Returns a query builder instance containing the given `filter`.
   */
  static where<T extends MongodbModel>(this: T, filter: Filter<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T>>> {
    return this.query<T>().where(filter)
  }

  /**
   * Returns a pending query instance for this model.
   */
  static query<T extends MongodbModel, ReturnType = any>(): QueryBuilder<InstanceType<T>, ReturnType> {
    return (new this() as unknown as InstanceType<T>).query<InstanceType<T>, ReturnType>()
  }

  /**
   * Returns a pending query instance for this model.
   */
  query<T extends MongodbDocument, ReturnType = any>(this: T): QueryBuilder<T, ReturnType> {
    return new QueryBuilder<T, ReturnType>(
      this.queryProcessor()
    )
  }

  /**
   * Returns a query processor instance for this model.
   */
  queryProcessor<T extends MongodbDocument>(): QueryProcessor<T> {
    return new QueryProcessor(this as unknown as T)
  }

  /**
   * Returns an aggregate query. Use the aggregate `builder` to customize the query.
   */
  static aggregate<T extends MongodbModel, ResultType = Array<InstanceType<T>>>(this: T, callback: AggregateBuilderCallback, options?: AggregateOptions): QueryBuilderContract<InstanceType<T>, ResultType> {
    return this.query<T>().aggregate(callback, options)
  }

  // static hasOne<T extends MongodbModel>(ModelClass: T | (() => T)): RelationBuilderContract {
  static hasOne<T extends MongodbModel>(ModelClass: T): RelationBuilderContract {
    if (isNullish(ModelClass)) {
      throw new Error(`Missing model class argument in one of your "hasOne" relations inside the "${this.name}" model`)
    }

    return new HasOneRelationBuilder(this, ModelClass)
  }

  static hasMany<T extends MongodbModel>(ModelClass: T): RelationBuilderContract {
    if (isNullish(ModelClass)) {
      throw new Error(`Missing model class argument in one of your "hasMany" relations inside the "${this.name}" model`)
    }

    // TODO

    return new RelationBuilder(this, ModelClass)
  }

  static belongsTo<T extends MongodbModel>(ModelClass: T): RelationBuilderContract {
    if (isNullish(ModelClass)) {
      throw new Error(`Missing model class argument in one of your "belongsTo" relations inside the "${this.name}" model`)
    }

    // TODO

    return new RelationBuilder(this, ModelClass)
  }

  /**
   * Returns the resolved relation for the given `name`.
   */
  resolveRelation (name: string): Relation {
    const mapping = this.getRelation(name)

    return mapping instanceof RelationBuilder
      ? mapping.resolve()
      : mapping as Relation
  }

  /**
   * Returns the resolved relation for the given `name`. Throws
   * an exception if no relation is defined for the `name`.
   */
  getRelation (name: string): RelationBuilderContract | Relation {
    const mapping = this.model().relations[name]

    if (!mapping) {
      throw new Error(`Relation "${name}" is not defined on your "${this.model().name}" model`)
    }

    return mapping
  }

  /**
   * Determine whether the relation for the given `name` is not defined on the model.
   */
  isMissingRelation (name: string): boolean {
    return !this.hasRelation(name)
  }

  /**
   * Determine whether the relation for the given `name` is defined on the model.
   */
  hasRelation (name: string): boolean {
    return !!this.model().relations[name]
  }

  /**
   * Tba.
   */
  ensureRelation (relationName: string): void {
    if (Str(relationName).isEmpty()) {
      return
    }

    const relationNames = Str(relationName).split('.')
    const root = relationNames.splice(0, 1)[0]
    const nested = relationNames.join('.')

    const relation = this.resolveRelation(root)

    // eslint-disable-next-line new-cap
    new relation.foreignModelClass().ensureRelation(nested)
  }
}
