
import { tap } from '@supercharge/goodies'
import { HelperDelegate } from 'handlebars'
import { Manager } from '@supercharge/manager'
import { HandlebarsDriver } from './drivers/handlebars/index.js'
import { Application, ViewConfig, ViewEngine, ViewResponseConfig, ViewSharedData } from '@supercharge/contracts'

export class ViewManager extends Manager<Application> implements ViewEngine {
  /**
   * Stores the internal view configuration object.
   */
  private readonly meta: {
    config: ViewConfig
  }

  /**
   * Create a new view manager instance.
   */
  constructor (app: Application, config: ViewConfig) {
    super(app)

    this.meta = { config }
    this.validateConfig()
  }

  /**
   * Validate the view config.
   */
  private validateConfig (): void {
    this.app.config().ensure('view', () => {
      throw new Error('Missing view configuration file. Make sure the "config/view.ts" file exists.')
    })

    this.app.config().ensure('view.driver')
  }

  /**
   * Returns the default driver name.
   */
  defaultDriver (): string {
    return this.meta.config.driver
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   */
  protected override driver (name?: string): ViewEngine {
    return super.driver(name)
  }

  /**
   * Create a Handlebars view renderer instance.
   */
  protected createHandlebarsDriver (): ViewEngine {
    return new HandlebarsDriver(this.app.logger(), this.meta.config.handlebars)
  }

  /**
   * Render the given view.
   */
  async render (view: string, data: any, config?: ViewResponseConfig): Promise<string> {
    return await this.driver().render(view, data, config)
  }

  /**
   * Render the given view.
   */
  async exists (view: string): Promise<boolean> {
    return await this.driver().exists(view)
  }

  /**
   * Register a partial view with the given `name` and `content` to the handlebars engine.
   */
  registerPartial (name: string, content: string): this {
    return tap(this, () => {
      this.driver().registerPartial(name, content)
    })
  }

  /**
   * Determine whether a partial view with the given `name` is registered.
   */
  hasPartial (name: string): boolean {
    return this.driver().hasPartial(name)
  }

  /**
   * Register a view helper with the given `name` and `content` to the view engine.
   */
  registerHelper (name: string, fn: HelperDelegate): this {
    return tap(this, () => {
      this.driver().registerHelper(name, fn)
    })
  }

  /**
   * Determine whether a view helper with the given `name` is registered.
   */
  hasHelper (name: string): boolean {
    return this.driver().hasHelper(name)
  }

  /**
   * Share a given state of data to all views, across HTTP requests.
   *
   * @example
   * ```
   * import { View } from '@supercharge/facades'
   *
   * View.share({ key: 'value' })
   * ```
   */
  share<K extends keyof ViewSharedData> (key: K, value: ViewSharedData[K]): this
  share (values: Partial<ViewSharedData>): this
  share (key: string | any, value?: any): this {
    this.driver().share(key, value)

    return this
  }

  /**
   * Returns the shared data.
   */
  sharedData (): Record<string, any> {
    return this.driver().sharedData()
  }

  /**
   * Boot the view engine driver.
   */
  async boot (): Promise<void> {
    await this.driver().boot()
  }
}
