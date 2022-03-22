'use strict'

import { Collection } from 'mongodb'
import { QueryProcessor } from '../query'
import { Relation } from './relations-contract'
import { MongodbModel } from './model-contract'
import { QueryBuilder } from '../query/builder'
import { ModelObject, HasId } from './utils-contract'
import { MongodbConnection, MongodbConnectionResolver } from './connection-contract'

export interface MongodbDocument extends HasId {
  // Idea:
  // /**
  //  * The relationships that should always be loaded.
  //  */
  // with: string[]

  /**
   * Returns the resolved relation for the given `name`. Throws
   * an exception if no relation is defined for the `name`.
   */
  resolveRelation(name: string): Relation

  /**
   * Determine whether the relation for the given `name` is defined on the model.
   */
  hasRelation(name: string): boolean
  isMissingRelation(name: string): boolean
  ensureRelation (name: string): void

  /**
   * Actions to perform on this document instance.
   */
  save(): Promise<this>
  update(values: Omit<Partial<MongodbDocument>, '_id'>): Promise<this>
  delete(): Promise<this>

  /**
   * Assign the given `values` to the document.
   */
  fill(values: Partial<MongodbDocument>): this

  /**
   * Merge the given `values` into the document.
   */
  merge(values: Partial<MongodbDocument>): this

  /**
   * Serialize this document to JSON.
   */
  toJSON(): ModelObject

  /**
   * Returns a plain JavaScript object.
   */
  toObject<T = ModelObject>(): T

  /**
   * Returns the model constructor.
   */
  model<T extends MongodbModel>(): T

  /**
   * Create a new instance of the given model.
   */
  newInstance<T extends MongodbDocument>(attributes?: ModelObject): T

  /**
   * Assign the given connection `resolver`.
   */
  setConnectionResolver(resolver: MongodbConnectionResolver): this

  /**
   * Returns the connection `resolver`.
   */
  getConnectionResolver(): MongodbConnectionResolver

  /**
   * Returns the database connection for the model.
   */
  getConnection(): Promise<MongodbConnection>

  /**
   * Returns the database collection for the model.
   */
  getCollection(): Promise<Collection>

  /**
   * Returns a pending query instance for this model.
   */
  query<T extends MongodbDocument, ReturnType = any>(): QueryBuilder<T, ReturnType>

  /**
   * Returns a query processor instance for this model.
   */
  queryProcessor<T extends MongodbDocument>(): QueryProcessor<T>
}
