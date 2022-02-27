'use strict'

import { QueryBuilder } from '../query/builder'
import { ModelObject, HasId } from './utils-contract'
import { MongodbConnectionResolver } from './connection-contract'
import { MongodbConnection } from '.'
import { Collection } from 'mongodb'

export interface MoonDocument extends HasId {
  /**
   * Actions to perform on this document instance.
   */
  save(): Promise<this>
  update(values: Omit<Partial<MoonDocument>, '_id'>): Promise<this>
  delete(): Promise<this>

  /**
   * Assign the given `values` to the document.
   */
  fill(values: Partial<MoonDocument>): this

  /**
   * Merge the given `values` into the document.
   */
  merge(values: Partial<MoonDocument>): this

  /**
   * Serialize this document to JSON.
   */
  toJSON(): ModelObject

  /**
   * Create a new instance of the given model.
   */
  newInstance<T extends MoonDocument>(attributes?: ModelObject): T

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
   * Returns a query builder instance for this model.
   */
  query<T extends MoonDocument>(): QueryBuilder<T>
}
