'use strict'

import { AggregateBuilderCallback, AggregatePipelineSortDirection } from './aggregation-builder-contract'
import { AggregateOptions, CountDocumentsOptions, DeleteOptions, Filter, FindOptions, ObjectId, UpdateFilter, UpdateOptions } from 'mongodb'

export type OrFailCallback = () => Error
export type QueryOptions = FindOptions | UpdateOptions | DeleteOptions | CountDocumentsOptions | AggregateOptions

export interface Lookup {
  name: string
  from: string
  localField: string
  foreignField: string
  as: string
}

export interface QueryBuilderContract<DocType, ResultType = DocType> {
  aggregate(builder: AggregateBuilderCallback, options?: AggregateOptions): this

  count(filter?: Filter<DocType>, options?: CountDocumentsOptions): this
  count(filter?: Filter<DocType>, options?: CountDocumentsOptions): this

  delete(): QueryBuilderContract<DocType, void>
  deleteOne(filter?: Filter<DocType>, options?: DeleteOptions): Promise<ResultType>
  deleteById(id: ObjectId | string, options?: DeleteOptions): Promise<ResultType>

  find(): Promise<ResultType>
  find(filter?: Filter<DocType>, options?: CountDocumentsOptions): Promise<ResultType>

  findOne(): Promise<ResultType | undefined>
  findOne(filter?: Filter<DocType>, options?: FindOptions<DocType>): Promise<ResultType>

  findById(id: ObjectId | string, options?: FindOptions<DocType>): Promise<ResultType>

  get(): Promise<ResultType>

  latest(): this
  oldest(): this

  sort(columns: Record<string, AggregatePipelineSortDirection>): this
  sort(column: string, direction?: AggregatePipelineSortDirection): this

  orFail(handler: () => Error): this
  where(filter?: Filter<DocType>): this
  with(...relations: string[]): this

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
