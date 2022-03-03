'use strict'

import { ModelObject } from './utils-contract'
import { QueryBuilder } from '../query/builder'
import { PendingQuery } from '../query/pending'
import { MongodbDocument } from './document-contract'
import { QueryBuilderContract } from './query-builder-contract'
import { MongodbConnectionResolver, MongodbConnection } from './connection-contract'
import { CountDocumentsOptions, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export interface MongodbModel {
  /**
   * Create a new instance.
   */
  new (values?: ModelObject): MongodbDocument

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
  all<T extends MongodbModel>(this: T): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T> | undefined>>

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, Array<InstanceType<T> | undefined>>

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  findOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined>

  /**
   * Returns the document for the given `id` or `undefined` if no document with that ID is available.
   */
  findById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: FindOptions<InstanceType<T>>): QueryBuilderContract<InstanceType<T>, InstanceType<T> | undefined>

  /**
   * Creates the given `document` in the database.
   */
  create<T extends MongodbModel>(this: T, document: T): Promise<InstanceType<T>>

  /**
   * Creates the given `documents` in the database.
   */
  createMany<T extends MongodbModel>(this: T, documents: T[]): Promise<void>

  /**
   * Updates the first document maching the given `filter` with values from `update`.
   */
  update<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options: UpdateOptions): QueryBuilderContract<InstanceType<T>, void>

  /**
   * Updates the first document maching the given `filter` with values from `update`.
   */
  updateOne<T extends MongodbModel>(this: T, values: UpdateFilter<InstanceType<T>>, options?: UpdateOptions): QueryBuilderContract<InstanceType<T>, InstanceType<T>>

  /**
   * Deletes all documents in the collection.
   */
  truncate<T extends MongodbModel>(this: T, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult>

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  delete<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult>

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, DeleteResult>

  /**
   * Delete the document for the given `id`. Does nothing if no document with that ID is available.
   */
  deleteById<T extends MongodbModel>(this: T, id: ObjectId | string, options?: DeleteOptions): QueryBuilderContract<InstanceType<T>, void>

  /**
   * Returns a query builder instance for this model.
   */
  query<T extends MongodbModel>(): QueryBuilder<InstanceType<T>>

  /**
   * Returns a pending query instance for this model.
   */
  pendingQuery<T extends MongodbModel, ReturnType = any>(): PendingQuery<InstanceType<T>, ReturnType>

  /**
   * Returns the number of documents in the model’s collection.
   */
  count<T extends MongodbModel>(this: T, filter?: Filter<InstanceType<T>>, options?: CountDocumentsOptions): QueryBuilderContract<InstanceType<T>, number>

  /**
   * Eager load the given `relations`.
   */
  with<T extends MongodbModel> (this: T, ...relations: string[]): QueryBuilder<InstanceType<T>>
}
