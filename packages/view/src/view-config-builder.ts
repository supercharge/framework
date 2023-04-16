'use strict'

import { tap } from '@supercharge/goodies'
import { ViewConfigBuilder as ViewConfigBuilderContract, ViewResponseConfig } from '@supercharge/contracts'

export class ViewConfigBuilder implements ViewConfigBuilderContract {
  /**
   * Stores the view config.
   */
  private readonly config: ViewResponseConfig

  /**
   * Create a new view config builder instance.
   */
  constructor (config: ViewResponseConfig) {
    this.config = config
  }

  /**
   * Set the base layout used to render this view. The given `name` identifies
   * the file name of the layout file in the configured layouts folder.
   *
   * @param {String} name
   *
   * @returns {ViewConfigBuilder}
   */
  layout (name: string): this {
    return tap(this, () => {
      this.config.layout = name
    })
  }
}
