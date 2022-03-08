'use strict'

import { tap } from '@supercharge/goodies'
import { AggregatePipelineLookupBuilder, AggregatePipelineLookupOptions } from '../contracts/aggregation-builder-contract'

export class AggregationLookupBuilder implements AggregatePipelineLookupBuilder {
  /**
   * Stores the lookup options.
   */
  private readonly lookup: Partial<AggregatePipelineLookupOptions>

  /**
   * Create a new instance.
   */
  constructor (lookup: Partial<AggregatePipelineLookupOptions>) {
    this.lookup = lookup
  }

  /**
   * Specify the `collection` name to perform the join.
   */
  from (collection: string): this {
    return tap(this, () => {
      this.lookup.from = collection
    })
  }

  /**
   * Specify the name of the new field containing the matched documents from the foreign collection.
   */
  as (as: string): this {
    return tap(this, () => {
      this.lookup.as = as
    })
  }

  /**
   * Specify the document’s `localField` to perform an equality match
   * with the document’s `foreignField` during the lookup.
   */
  localField (field: string): this {
    return tap(this, () => {
      this.lookup.localField = field
    })
  }

  /**
   * Specify the document’s `foreignField` to perform an equality
   * match with the document’s `localField` during the lookup.
   */
  foreignField (field: string): this {
    return tap(this, () => {
      this.lookup.foreignField = field
    })
  }

  /**
   * Specify the variables to use in the pipeline stages. Use variable
   * expressions like `"$$<variable>"` to access the document fields
   * that are input to the pipeline.
   */
  let (assignments: Record<string, any>): this {
    return tap(this, () => {
      this.lookup.let = assignments
    })
  }

  /**
   * Assign a `pipeline` to run on the foreign collection. The `pipeline`
   * returns documents from the foreign collection. To return all the
   * documents from the foreign collection use an empty array `[]`.
   */
  pipeline (pipeline: any[]): this {
    return tap(this, () => {
      this.lookup.pipeline = pipeline
    })
  }
}
