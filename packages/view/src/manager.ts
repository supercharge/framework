
import { tap } from '@supercharge/goodies'
import { HelperDelegate } from 'handlebars'
import { Manager } from '@supercharge/manager'
import { HandlebarsCompiler } from './engines/handlebars/index.js'
import { Application, ViewConfig, ViewEngine, ViewResponseConfig } from '@supercharge/contracts'

export class ViewManager extends Manager implements ViewEngine {
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
    this.ensureConfig('view', () => {
      throw new Error('Missing view configuration file. Make sure the "config/view.ts" file exists.')
    })

    this.ensureConfig('view.driver')
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
    return new HandlebarsCompiler(this.app.logger(), this.meta.config.handlebars)
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
   * Boot the view engine driver.
   */
  async boot (): Promise<void> {
    await this.driver().boot()
  }
}
