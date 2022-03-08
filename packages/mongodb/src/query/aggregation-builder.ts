'use strict'

import { tap } from '@supercharge/goodies'
import { ModelObject } from '../contracts'
import { AggregationStageBuilder } from './aggregation-stage-builder'
import { AggregationBuilderContract, AggregationStageBuilderContract, AggregatePipeline, AggregatePipelineSortDirection, AggregatePipelineLookupBuilderCallback, AggregatePipelineLookupOptions } from '../contracts/aggregation-builder-contract'

export class AggregationBuilder implements AggregationBuilderContract {
  /**
   * Stores the aggregation pipeline details.
   */
  private readonly meta: {
    stageBuilders: AggregationStageBuilderContract[]
  }

  /**
   * Create a new instance.
   */
  constructor () {
    this.meta = { stageBuilders: [] }
  }

  /**
   * Returns the aggregation pipeline.
   */
  pipeline (): AggregatePipeline {
    return this.meta.stageBuilders.map(stageBuilder => {
      return stageBuilder.get()
    })
  }

  /**
   * Returns the aggregation stage builder instances.
   */
  stageBuilders (): AggregationStageBuilderContract[] {
    return this.meta.stageBuilders
  }

  /**
   * Creates and returns a new aggregation stage and also adds it to the pipeline.
   */
  stage (): AggregationStageBuilderContract {
    return tap(this.stageBuilder(), stageBuilder => {
      this.append(stageBuilder)
    })
  }

  /**
   * Returns a new aggregation stage instance.
   */
  stageBuilder (): AggregationStageBuilderContract {
    return new AggregationStageBuilder()
  }

  /**
   * Assign the given aggregation `stage` to the pipeline.
   */
  private append (stageBuilder: AggregationStageBuilderContract): this {
    return tap(this, () => {
      this.stageBuilders().push(stageBuilder)
    })
  }

  /**
   * Limit the number of returned entries to the given `limit`
   */
  limit (limit: number): this {
    return tap(this, () => {
      this.stage().limit(limit)
    })
  }

  /**
   * Sort the result by the given `columns`.
   */
  skip (amount: number): this {
    return tap(this, () => {
      this.stage().skip(amount)
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
      this.stage().sort(column, this.sortDirection(direction))
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
      this.stage().sort(sorting)
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
   * Appends a given lookup operation for the given `filter`
   * or by using the provided builder in the `callback`.
   */
  lookup (callback: AggregatePipelineLookupBuilderCallback): this
  lookup (options: AggregatePipelineLookupOptions): this
  lookup (callbackOrOptions: AggregatePipelineLookupBuilderCallback | AggregatePipelineLookupOptions): this {
    return tap(this, () => {
      this.stage().lookup(callbackOrOptions)
    })
  }

  /**
   * Filter the documents to match the given `criteria`.
   */
  match (criteria: ModelObject): this {
    return tap(this, () => {
      this.stage().match(criteria)
    })
  }
}
