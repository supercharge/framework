'use strict'

import { ModelObject } from '.'

export type AggregateBuilderCallback = (builder: AggregationBuilderContract) => unknown
export type AggregatePipelineLookupBuilderCallback = (builder: AggregatePipelineLookupBuilder) => unknown

export type AggregatePipeline = AggregateStage[]

export type AggregateStage =
  AggregatePipelineLimit
  | AggregatePipelineLookup
  | AggregatePipelineMatch
  | AggregatePipelineSkip
  | AggregatePipelineSort
  | {}

export interface AggregationBuilderContract extends BaseAggregationBuilderContract {
  /**
   * Returns the aggregation pipeline.
   */
  pipeline(): AggregatePipeline
}

export interface AggregationStageBuilderContract extends BaseAggregationBuilderContract {
  /**
   * Returns the aggregation stage object.
   */
  get(): AggregateStage
}

export interface BaseAggregationBuilderContract {
  /**
   * Limit the number of returned entries to the given `limit`
   */
  limit(limit: number): this

  /**
   * Skip the given `amount` of documents in the query.
   */
  skip(amount: number): this

  /**
   * Sort the result by a given column or an object.
   */
  sort(column: Record<string, AggregatePipelineSortDirection>): this
  sort(column: string, direction?: AggregatePipelineSortDirection): this
  sort(column: string | Record<string, AggregatePipelineSortDirection>, direction?: AggregatePipelineSortDirection): this

  /**
   * Appends a $lookup operator to this aggregation pipeline.
   */
  lookup(callback: AggregatePipelineLookupBuilderCallback): this
  lookup(filter: AggregatePipelineLookupOptions): this
  lookup(callbackOrOptions: AggregatePipelineLookupBuilderCallback | AggregatePipelineLookupOptions): this

  /**
   * Appends a $match operator to this aggregation  pipeline.
   */
  match(options: AggregatePipelineMatch['$match']): this
}

export interface AggregatePipelineLimit {
  /** [`$limit` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/) */
  $limit: number
}

export interface AggregatePipelineSkip {
  /** [`$skip` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/skip/) */
  $skip: number
}

export type AggregatePipelineSortDirection = -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending'

export interface AggregatePipelineSort {
  /** [`$sort` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/) */
  $sort: Record<string, 1 | -1 | { $meta: 'textScore' }>
}

export interface AggregatePipelineLookupBuilder {
  from(from: string): this
  as(from: string): this
  localField(field: string): this
  foreignField(field: string): this
  let(assignments: Record<string, any>): this
  pipeline(pipeline: any[]): this
}

export interface AggregatePipelineLookupOptions {
  from: string
  as: string
  localField?: string
  foreignField?: string
  let?: Record<string, any>
  pipeline?: any[]
}

export interface AggregatePipelineLookup {
  /** [`$lookup` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) */
  $lookup: AggregatePipelineLookupOptions
}

export interface AggregatePipelineMatch {
  /** [`$match` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/match/) */
  $match: ModelObject
}
