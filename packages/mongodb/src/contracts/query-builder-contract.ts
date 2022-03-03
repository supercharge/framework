'use strict'

import { CountDocumentsOptions, DeleteOptions, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export interface Lookup {
  name: string
  from: string
  localField: string
  foreignField: string
  as: string
}

export interface QueryBuilderContract<DocType, ResultType> {
  count(filter?: Filter<DocType>, options?: CountDocumentsOptions): Promise<ResultType>

  delete(): Promise<ResultType>
  deleteOne(filter?: Filter<DocType>, options?: DeleteOptions): Promise<ResultType>
  deleteById(id: ObjectId | string, options?: DeleteOptions): Promise<ResultType>

  find(): Promise<ResultType>
  find(filter?: Filter<DocType>, options?: CountDocumentsOptions): Promise<ResultType>

  findOne(): Promise<ResultType | undefined>
  findOne(filter?: Filter<DocType>, options?: FindOptions<DocType>): Promise<ResultType>

  findById(id: ObjectId | string, options?: FindOptions<DocType>): Promise<ResultType>

  where(filter?: Filter<DocType>): this

  run(): Promise<ResultType>

  truncate(options?: DeleteOptions): Promise<ResultType>

  update(values: UpdateFilter<DocType>): Promise<ResultType>
  update(values: UpdateFilter<DocType>, options?: UpdateOptions): Promise<ResultType>

  updateOne(values: UpdateFilter<DocType>): Promise<ResultType>
  updateOne(values: UpdateFilter<DocType>, options?: UpdateOptions): Promise<ResultType>

  /**
   * Promise interface
   */
  then: Promise<ResultType>['then']
  catch: Promise<ResultType>['catch']

}
