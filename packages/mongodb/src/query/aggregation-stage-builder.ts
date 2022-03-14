'use strict'

import { tap } from '@supercharge/goodies'
import { ModelObject } from '../contracts'
import { AggregationLookupBuilder } from './aggregation-lookup-builder'
import { AggregationStageBuilderContract, AggregateStage, AggregatePipelineSortDirection, AggregatePipelineLookupBuilderCallback, AggregatePipelineLookupOptions, AggregatePipelineUnwindBuilderCallback, AggregatePipelineUnwindOptions } from '../contracts/aggregation-builder-contract'
import { AggregationUnwindBuilder } from './aggregation-unwind-builder'

export class AggregationStageBuilder implements AggregationStageBuilderContract {
  /**
   * Stores the aggregation’s stage details.
   */
  private readonly meta: {
    stage: AggregateStage
  }

  /**
   * Create a new instance.
   */
  constructor () {
    this.meta = { stage: {} }
  }

  /**
   * Returns the plain aggregation stage object.
   */
  get (): AggregateStage {
    return this.meta.stage
  }

  /**
   * Merge the given `stage` to this aggregation stage.
   */
  merge (stage: AggregateStage): this {
    Object.assign(this.get(), stage)

    return this
  }

  /**
   * Limit the number of returned entries to the given `limit`
   */
  limit (limit: number): this {
    return tap(this, () => {
      this.merge({ $limit: limit })
    })
  }

  /**
   * Sort the result by the given `columns`.
   */
  skip (amount: number): this {
    return tap(this, () => {
      this.merge({ $skip: amount })
    })
  }

  /**
   * Sort the result by a given column or an object.
   */
  sort (columns: Record<string, AggregatePipelineSortDirection>): this
  sort (column: string, direction?: AggregatePipelineSortDirection): this
  sort (column: string | Record<string, AggregatePipelineSortDirection>, direction?: AggregatePipelineSortDirection): this {
    return typeof column === 'string'
      ? this.sortByColumn(column, direction)
      : this.sortByObject(column)
  }

  /**
   * Sort the result by the given `column` in the given `direction`. The
   * default sorting `direction` is ascending and you may customize it.
   */
  private sortByColumn (column: string, direction?: AggregatePipelineSortDirection): this {
    return tap(this, () => {
      this.merge({ $sort: { [column]: this.sortDirection(direction) } })
    })
  }

  /**
   * Sort the result by the given `columns` object. The `columns` object
   * defines the key-value pair used for sorting. The key identifies
   * the sorting value and the related value specifies a `direction`.
   */
  private sortByObject (columns: Record<string, AggregatePipelineSortDirection>): this {
    const sorting = Object.entries(columns).reduce<Record<string, 1 | -1>>((sorting, [column, direction]) => {
      sorting[column] = this.sortDirection(direction)

      return sorting
    }, {})

    return tap(this, () => {
      this.merge({ $sort: sorting })
    })
  }

  /**
   * Returns the resolved sort direction. MongoDB expects the sort direction to
   * be an integer. The integer value `1` represents an ascending sort order
   * whereas `-1` represents a descending sort order. This gets resolved.
   */
  private sortDirection (direction: AggregatePipelineSortDirection = 'asc'): -1 | 1 {
    switch (direction) {
      case 'asc':
      case 'ascending':
        return 1

      case 'desc':
      case 'descending':
        return -1

      default:
        return direction
    }
  }

  /**
   * Perform a join to a foreign collection. Use the lookup builder by
   * providing a callback function or define the lookup as an object.
   */
  lookup (callback: AggregatePipelineLookupBuilderCallback): this
  lookup (options: AggregatePipelineLookupOptions): this
  lookup (callbackOrOptions: AggregatePipelineLookupBuilderCallback | AggregatePipelineLookupOptions): this {
    return typeof callbackOrOptions === 'function'
      ? this.builderLookup(callbackOrOptions)
      : this.objectLookup(callbackOrOptions)
  }

  /**
   * Compose the lookup options using a fluent builder.
   */
  private builderLookup (callback: AggregatePipelineLookupBuilderCallback): this {
    const options = {}
    const lookupBuilder = new AggregationLookupBuilder(options)
    callback(lookupBuilder)

    return tap(this, () => {
      this.merge({ $lookup: options })
    })
  }

  /**
   * Directly provide the lookup `options`.
   */
  private objectLookup (options: AggregatePipelineLookupOptions): this {
    return tap(this, () => {
      this.merge({ $lookup: options })
    })
  }

  /**
   * Filter the documents to match the given `criteria`.
   */
  match (criteria: ModelObject): this {
    return tap(this, () => {
      this.merge({ $match: criteria })
    })
  }

  /**
   * Unwind a given path in the aggregation pipeline.
   */
  unwind (callback: AggregatePipelineUnwindBuilderCallback): this
  unwind (path: string): this
  unwind (options: AggregatePipelineUnwindOptions): this
  unwind (callbackOrPathOrOptions: AggregatePipelineUnwindBuilderCallback | string | AggregatePipelineUnwindOptions): this {
    if (typeof callbackOrPathOrOptions === 'function') {
      return this.runUnwindBuilder(callbackOrPathOrOptions)
    }

    return tap(this, () => {
      this.merge({ $unwind: callbackOrPathOrOptions })
    })
  }

  /**
   * Compose the $unwind options using a fluent builder.
   */
  private runUnwindBuilder (callback: AggregatePipelineUnwindBuilderCallback): this {
    const options = {}
    const unwindBuilder = new AggregationUnwindBuilder(options)
    callback(unwindBuilder)

    return tap(this, () => {
      this.merge({ $unwind: options })
    })
  }
}
