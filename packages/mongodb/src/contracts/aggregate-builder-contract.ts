'use strict'

import { ModelObject } from '.'

export type AggregateBuilderCallback = (builder: AggregateBuilder) => unknown

export type AggregatePipeline = Array<
AggregatePipelineLimit
| AggregatePipelineLookup
| AggregatePipelineMatch
>

export interface AggregateBuilder {
  /**
   * Appends a $limit operator to this aggregate pipeline.
   */
  limit(options: AggregatePipelineLimit['$limit']): this

  /**
   * Appends a $lookup operator to this aggregate pipeline.
   */
  lookup(options: AggregatePipelineLookup['$lookup']): this

  /**
   * Appends a $match operator to this aggregate pipeline.
   */
  match(options: AggregatePipelineMatch['$match']): this
}

export interface AggregatePipelineLimit {
  /** [`$limit` reference](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/) */
  $limit: number
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
