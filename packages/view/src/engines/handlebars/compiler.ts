'use strict'

import Path from 'path'
import Handlebars from 'handlebars'
import Str from '@supercharge/strings'
import Fs from '@supercharge/filesystem'
import Collect from '@supercharge/collections'
import { esmResolve } from '@supercharge/goodies'
import { Application, ConfigStore, Logger, ViewConfig, ViewEngine } from '@supercharge/contracts'

export class HandlebarsCompiler implements ViewEngine {
  /**
   * The instance meta data.
   */
  private readonly meta: {
    /**
     * The application instance.
     */
    app: Application

    /**
     * The handlebars renderer instance.
     */
    handlebars: typeof Handlebars

    /**
     * The view file extension.
     */
    extension: string
  }

  /**
   * Create a new renderer instance.
   *
   * @param app
   */
  constructor (app: Application) {
    this.meta = { app, handlebars: Handlebars.create(), extension: '.hbs' }
  }

  /**
   * Returns the application instance.
   *
   * @returns {Application}
   */
  app (): Application {
    return this.meta.app
  }

  /**
   * Returns the view config.
   *
   * @returns {Application}
   */
  config (): ConfigStore {
    return this.app().config()
  }

  /**
   * Returns the logger instance.
   *
   * @returns {Logger}
   */
  logger (): Logger {
    return this.app().logger()
  }

  /**
   * Returns the handlebars renderer instance.
   *
   * @returns {Handlebars}
   */
  compiler (): typeof Handlebars {
    return this.meta.handlebars
  }

  /**
   * Returns the view file extension.
   *
   * @returns {Handlebars}
   */
  extension (): string {
    return this.meta.extension
  }

  /**
   * Returns the path to view layouts.
   *
   * @returns {string}
   */
  async layoutLocation (): Promise<string> {
    const layoutLocation = String(this.config().get('view.handlebars.layouts'))

    if (await Fs.exists(layoutLocation)) {
      return layoutLocation
    }

    throw new Error(`Path to view layouts not existing. Received ${layoutLocation}`)
  }

  /**
   * Returns the path to view layouts.
   *
   * @returns {string}
   */
  defaultLayout (): string {
    return String(
      this.config().get('view.handlebars.defaultLayout')
    )
  }

  /**
   * Determine whether a default layout is configured.
   *
   * @returns {Boolean}
   */
  hasDefaultLayout (): boolean {
    return Str(
      this.defaultLayout()
    ).isNotEmpty()
  }

  /**
   * Returns the path to view templates.
   *
   * @returns {string}
   */
  async viewsLocation (): Promise<string> {
    const viewsLocation = String(this.config().get('view.handlebars.views'))

    if (await Fs.exists(viewsLocation)) {
      return viewsLocation
    }

    throw new Error(`Path to view files not existing. Received ${viewsLocation}`)
  }

  /**
   * Returns the path to the view helpers.
   *
   * @returns {string}
   */
  async partialsLocations (): Promise<string[]> {
    return await Collect(
      this.config().get('view.handlebars.partials')
    ).filter(async path => {
      return await Fs.exists(path)
    })
  }

  /**
   * Returns the path to the view helpers.
   *
   * @returns {string}
   */
  async helpersLocations (): Promise<string[]> {
    return await Collect(Path.resolve(__dirname, 'helpers'))
      .concat(this.config().get('view.handlebars.helpers'))
      .filter(async path => {
        return await Fs.exists(path)
      })
  }

  /**
   * Boot the Handlebars engine. This may contain loading partial views
   * or view helpers. Anything that need’s to be done during a
   * setup phase belongs into this helpful lifecycle method.
   */
  async boot (): Promise<void> {
    await this.loadPartials()
    await this.loadHelpers()
  }

  /**
   * Load and register partial views.
   */
  async loadPartials (): Promise<void> {
    for (const location of await this.partialsLocations()) {
      await Collect(
        await Fs.allFiles(location)
      )
        .filter(partial => this.isViewFile(partial))
        .forEach(async view => await this.registerPartial(view, location))
    }
  }

  /**
   * Determine whether the given file is a script file and not a TypeScript definition.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  isViewFile (file: string): boolean {
    return file.endsWith(
      this.extension()
    )
  }

  /**
   * Register the given partial view `file` to the handlebars engine.
   *
   * @param {string} file
   */
  async registerPartial (file: string, basePath: string): Promise<void> {
    try {
      this.compiler().registerPartial(
        this.partialNameFrom(file, basePath), await Fs.readFile(file)
      )
    } catch (error) {
      this.logger().warning(`WARNING: failed to register partial "${file}": ${String(error.message)}`)
    }
  }

  /**
   * Retrieves the partial name from its file path on disk. The
   * name derives from the path by removing the base path and
   * view fileextension. For example, a partial view located
   * at `nav/center.hbs` receives the partial name `nav/center`.
   *
   * @param {String} path
   * @param {String} basePath
   *
   * @returns {String}
   */
  partialNameFrom (path: string, basePath: string): string {
    return Str(path)
      .ltrim(basePath)
      .ltrim(Path.sep)
      .rtrim(this.extension())
      .rtrim('.')
      .get()
  }

  /**
   * Load and register view helpers.
   */
  async loadHelpers (): Promise<void> {
    await Collect(
      await this.helpersLocations()
    )
      .flatMap(async helpersPath => await Fs.allFiles(helpersPath))
      .filter(helper => this.isScriptFile(helper))
      .forEach(async helper => await this.registerHelper(helper))
  }

  /**
   * Determine whether the given file is a script file and not a TypeScript definition.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  isScriptFile (file: string): boolean {
    return file.endsWith('.d.ts')
      ? false
      : ['.js', '.ts'].includes(Path.extname(file))
  }

  /**
   * Register the given view helper `file` to the handlebars engine.
   *
   * @param {string} file
   */
  async registerHelper (file: string): Promise<void> {
    try {
      const helper = esmResolve(require(file))
      const name = await Fs.filename(file)

      typeof helper === 'function'
        ? this.compiler().registerHelper(name, helper)
        : this.logger().warning(`View helper "${file}" is not a function, received "${typeof helper}"`)
    } catch (error) {
      this.logger().warning(`WARNING: failed to load helper "${file}": ${String(error.message)}`)
    }
  }

  /**
   * Determine whether the given `view` exists.
   *
   * @param {String} view
   *
   * @returns {Boolean}
   */
  async exists (view: string): Promise<boolean> {
    return await Fs.exists(
      Path.resolve(await this.viewsLocation(), view)
    )
  }

  /**
   * Returns the rendered HTML view.
   *
   * @param {string} view
   * @param {*} data
   *
   * @returns {String}
   */
  async render (view: string, data: any, viewConfig: ViewConfig = {}): Promise<string> {
    return await this.shouldRenderWithLayout(viewConfig)
      ? await this.renderWithLayout(view, data, viewConfig)
      : await this.renderView(view, data)
  }

  /**
   * Determine whether to render a view with a layout.
   *
   * @param viewConfig
   *
   * @returns {Boolean}
   */
  private async shouldRenderWithLayout (viewConfig: ViewConfig): Promise<boolean> {
    return !!viewConfig.layout || this.hasDefaultLayout()
  }

  /**
   * Returns a rendered HTML view. The rendered `view` will be
   * placed into a `content` placeholder of the default layout.
   *
   * @param view
   * @param data
   *
   * @returns {String}
   */
  async renderWithLayout (view: string, data: any, viewConfig: ViewConfig): Promise<string> {
    const layout = await this.compile(this.getLayout(viewConfig), { isLayout: true })

    const context: any = data || {}
    context.content = await this.renderView(view, data)

    return layout(context)
  }

  private getLayout (viewConfig: ViewConfig): string {
    return viewConfig.layout || this.defaultLayout()
  }

  /**
   * Returns the HTML of the given `view`.
   *
   * @param {String} view
   * @param {*} data
   *
   * @returns {String}
   */
  async renderView (view: string, data: any): Promise<string> {
    const template = await this.compile(view, { isLayout: false })

    return template(data)
  }

  /**
   * Compile the given `template` to a render function.
   *
   * @param view
   *
   * @returns {Function}
   */
  async compile (view: string, options: ReadTemplateOptions = {}): Promise<HandlebarsTemplateDelegate> {
    return this.compiler().compile(
      await this.readTemplate(view, options)
    )
  }

  /**
   * Reads and returns the view `template` from the hard disk.
   *
   * @param template
   * @param options
   *
   * @returns {String}
   */
  async readTemplate (template: string, { isLayout = false }: ReadTemplateOptions): Promise<string> {
    const view = isLayout
      ? Path.resolve(await this.layoutLocation(), template)
      : Path.resolve(await this.viewsLocation(), template)

    return await Fs.readFile(
      this.ensureHbs(view)
    )
  }

  /**
   * Appends the view file extension when needed.
   *
   * @param {String} template
   *
   * @returns {String}
   */
  ensureHbs (template: string): string {
    return Str(template).finish(
      this.extension()
    ).get()
  }
}

interface ReadTemplateOptions {
  isLayout?: boolean
}
