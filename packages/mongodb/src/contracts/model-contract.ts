'use strict'

import { Lookup } from '.'
import { ModelObject } from './utils-contract'
import { QueryBuilder } from '../query/builder'
import { MoonDocument } from './document-contract'
import { MongoDbDatabase } from './database-contract'
import { Collection, DeleteOptions, DeleteResult, Filter, FindOptions, ObjectId, UpdateFilter } from 'mongodb'

export interface MoonModel {
  /**
   * Create a new instance.
   */
  new (values?: ModelObject): MoonDocument

  /**
   * Adapter to work as a bridge between query builder and the model
   */
  database: MongoDbDatabase

  /**
   * Stores relations to other models.
   */
  relations: Lookup[]

  /**
   * Returns the MongoDB collection.
   */
  collection (): Collection

  /**
   * Returns an array of all documents.
   */
  all<T extends MoonModel>(this: T): Promise<Array<InstanceType<T>>>

  /**
   * Returns an array of documents maching the given `filter` and `options`.
   * Returns an empty array if no documents were found in the collection.
   */
  find<T extends MoonModel>(this: T, filter?: Filter<T>, options?: FindOptions<T>): Promise<Array<InstanceType<T>>>

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  findOne<T extends MoonModel>(this: T, filter?: Filter<T>, options?: FindOptions<T>): Promise<InstanceType<T> | undefined>

  /**
   * Tba.
   */
  findById<T extends MoonModel>(this: T, id: ObjectId | string, options?: FindOptions<T>): Promise<InstanceType<T> | undefined>

  /**
   * Returns the first document maching the given `filter` and `options`.
   * Returns undefined if no document was found in the collection.
   */
  create<T extends MoonModel>(this: T, document: T): Promise<InstanceType<T>>

  /**
   * Updates the updated document maching the given `filter` and `options`.
   */
  updateOne<T extends MoonModel>(this: T, filter: Filter<T>, update: UpdateFilter<T> | Partial<T>): Promise<InstanceType<T>>

  /**
   * Deletes all documents in the collection.
   */
  truncate<T extends MoonModel>(this: T, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Deletes the documents matching the given `filter` and delete `options`.
   * Use the `Model.truncate` method to delete all documents in the collection.
   */
  delete<T extends MoonModel>(this: T, filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Deletes the first document matching the given `filter` and `options`.
   * In case the `filter` and `options` are empty or an empty object,
   * this query deletes the first match.
   */
  deleteOne<T extends MoonModel>(this: T, filter?: Filter<T>, options?: DeleteOptions): Promise<DeleteResult>

  /**
   * Returns a query builder instance for this model.
   */
  query<T extends MoonModel>(this: T): QueryBuilder<T>

  /**
   * Eager load the given `relations`.
   */
  with<T extends MoonModel> (this: T, ...relations: string[]): QueryBuilder<T>
}
