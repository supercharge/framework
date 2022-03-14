'use strict'

import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { AggregatePipelineUnwindBuilder, AggregatePipelineUnwindOptions } from '../contracts/aggregation-builder-contract'

export class AggregationUnwindBuilder implements AggregatePipelineUnwindBuilder {
  /**
   * Stores the unwind options.
   */
  private readonly unwind: Partial<AggregatePipelineUnwindOptions>

  /**
   * Create a new instance.
   */
  constructor (unwind: Partial<AggregatePipelineUnwindOptions>) {
    this.unwind = unwind
  }

  /**
   * Assign the field `path` to an array field. To specify a field path,
   * prefix the field name with a dollar sign $ and enclose in quotes.
   */
  path (path: string): this {
    return tap(this, () => {
      this.unwind.path = path
    })
  }

  /**
   * Preserve null or empty values when the path is null or missing or an
   * empty array. By default, this $unwind operation does not output a
   * document. No values are assigned when the given `path` is empty.
   */
  preserveNullAndEmptyArrays (): this {
    return tap(this, () => {
      this.unwind.preserveNullAndEmptyArrays = true
    })
  }

  /**
   * Assign the name of a new `field` to hold the array index of the element.
   * The given `field` name cannot start with a dollar sign $. This method
   * trims any dollar sign from the beginning of the given `field` name.
   */
  includeArrayIndexForField (field: string): this {
    return tap(this, () => {
      this.unwind.includeArrayIndex = Str(field).ltrim('$').get()
    })
  }
}
