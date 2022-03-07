'use strict'

import { tap } from '@supercharge/goodies'
import { ModelObject } from '../contracts'
import { AggregationBuilder as AggregateBuilderContract, AggregatePipeline, AggregatePipelineSort } from '../contracts/aggregation-builder-contract'

export class AggregationBuilder implements AggregateBuilderContract {
  /**
   *
   */
  private readonly meta: {
    pipeline: AggregatePipeline
  }

  /**
   * Create a new document instance for this model.
   */
  constructor () {
    this.meta = { pipeline: [] }
  }

  /**
   * Returns the aggregation pipeline.
   */
  pipeline (): AggregatePipeline {
    return this.meta.pipeline
  }

  /**
   * Limit the number of returned entries to the given `limit`
   */

  limit (limit: number): this {
    return tap(this, () => {
      this.pipeline().push({ $limit: limit })
    })
  }

  /**
   * Sort the result by the given `columns`.
   */
  skip (amount: number): this {
    return tap(this, () => {
      this.pipeline().push({ $skip: amount })
    })
  }

  /**
   * Appends a $limit operator to this aggregate pipeline.
   */
  sort (options: AggregatePipelineSort['$sort']): this {
    return tap(this, () => {
      this.pipeline().push({ $sort: options })
    })
  }

  /**
   * Appends the given lookup `filter`.
   */
  lookup (filter: { from: string, as: string, localField?: string | undefined, foreignField?: string | undefined, let?: Record<string, any> | undefined, pipeline?: any[] | undefined }): this {
    return tap(this, () => {
      this.pipeline().push({ $lookup: filter })
    })
  }

  /**
   * Filter the documents to match the given `criteria`.
   */
  match (criteria: ModelObject): this {
    return tap(this, () => {
      this.pipeline().push({ $match: criteria })
    })
  }
}
