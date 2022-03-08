'use strict'

import { ModelObject } from '.'

export type AggregateBuilderCallback = (builder: AggregationBuilderContract) => unknown

export type AggregatePipeline =
  Array<
  AggregatePipelineLimit
  | AggregatePipelineLookup
  | AggregatePipelineMatch
  | AggregatePipelineSkip
  | AggregatePipelineSort
  >

export interface AggregationBuilderContract {
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
  lookup(options: AggregatePipelineLookup['$lookup']): this

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

export interface AggregatePipelineLookup {
  /** [`$lookup` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) */
  $lookup: {
    from: string
    as: string
    localField?: string
    foreignField?: string
    let?: Record<string, any>
    pipeline?: any[]
  }
}

export interface AggregatePipelineMatch {
  /** [`$match` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/match/) */
  $match: ModelObject
}
