'use strict'

import { tap } from '@supercharge/goodies'
import { ModelObject } from '../contracts'
import { AggregateBuilder as AggregateBuilderContract, AggregatePipeline } from '../contracts/aggregate-builder-contract'

export class AggregateBuilder implements AggregateBuilderContract {
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
   * Appends the given lookup `filter`.
   */
  lookup (filter: { from: string, as: string, localField?: string | undefined, foreignField?: string | undefined, let?: Record<string, any> | undefined, pipeline?: any[] | undefined }): this {
    return tap(this, () => {
      this.pipeline().push({ $lookup: filter })
    })
  }

  match (options: ModelObject): this {
    return tap(this, () => {
      this.pipeline().push({ $match: options })
    })
  }

  limit (limit: number): this {
    return tap(this, () => {
      this.pipeline().push({ $limit: limit })
    })
  }
}
