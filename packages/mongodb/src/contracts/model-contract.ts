'use strict'

import { ModelObject } from './utils-contract'
import { QueryBuilder } from '../query/builder'
import { MoonDocument } from './document-contract'
import { MongodbConnectionResolver, MongodbConnection } from './connection-contract'
import { DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter } from 'mongodb'

export interface MoonModel {
  /**
   * Create a new instance.
   */
  new (values?: ModelObject): MoonDocument

  /**
   * Returns the database connection name.
   */
  connection: string

  /**
   * Returns the collection name.
   */
  collection: string

  /**
   * Assign the connection resolver.
   */
  setConnectionResolver(resolver: MongodbConnectionResolver): this

  /**
   * Returns the connection resolver instance.
   */
  getConnectionResolver(): MongodbConnectionResolver

  /**
   * Returns the MongoDB connection.
   */
  resolveConnection (name?: string): Promise<MongodbConnection>

  /**
   * Returns an array of all documents.
   */
  all<T extends MoonModel>(this: T): Promise<Array<InstanceType<T>>>

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): Promise<Array<InstanceType<T>>>

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  findOne<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): Promise<InstanceType<T> | undefined>

  /**
   * Tba.
   */
  findById<T extends MoonModel>(this: T, id: ObjectId | string, options?: FindOptions<InstanceType<T>>): Promise<InstanceType<T> | undefined>

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  create<T extends MoonModel>(this: T, document: T): Promise<InstanceType<T>>

  /**
   * Updates the updated document maching the given `filter` and `options`.
   */
  updateOne<T extends MoonModel>(this: T, filter: Filter<InstanceType<T>>, update: UpdateFilter<InstanceType<T>> | Partial<T>): Promise<InstanceType<T>>

  /**
   * Deletes all documents in the collection.
   */
  truncate<T extends MoonModel>(this: T, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  delete<T extends MoonModel>(this: T, filter: Filter<InstanceType<T>>, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne<T extends MoonModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Returns a query builder instance for this model.
   */
  query<T extends MoonModel>(): QueryBuilder<InstanceType<T>>

  /**
   * Eager load the given `relations`.
   */
  with<T extends MoonModel> (this: T, ...relations: string[]): QueryBuilder<InstanceType<T>>
}
