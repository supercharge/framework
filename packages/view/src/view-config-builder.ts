
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
   * Create a new view config builder instance.
   */
  static from (config: ViewResponseConfig): ViewConfigBuilder {
    return new this(config)
  }

  /**
   * Set the base layout used to render this view. The given `name` identifies
   * the file name of the layout file in the configured layouts folder.
   */
  layout (name: string): this {
    return tap(this, () => {
      this.config.layout = name
    })
  }

  /**
   * Render this view without a base layout.
   */
  withoutLayout (): this {
    return this.layout('')
  }
}
