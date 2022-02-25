'use strict'

import { Connection } from '../connection'
import { ModelObject, HasId } from './utils-contract'

export interface MoonDocument extends HasId {
  /**
   * Actions to perform on this document instance.
   */
  save(): Promise<this>
  update(values: Omit<Partial<MoonDocument>, '_id'>): Promise<this>
  delete(): Promise<this>

  /**
   * Load relationships onto the instance
   */
  load(...relationships: string[]): Promise<void>

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
   * Assign the given `database` to the model.
   */
  withDatabase(db: Connection): this
}
