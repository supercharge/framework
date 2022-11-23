'use strict'

import Path from 'path'
import Fs from '@supercharge/fs'
import Str from '@supercharge/strings'
import Collect from '@supercharge/collections'
import { esmResolve, tap } from '@supercharge/goodies'
import Handlebars, { HelperDelegate } from 'handlebars'
import { Logger, ViewConfig, ViewEngine, ViewResponseConfig } from '@supercharge/contracts'

export class HandlebarsCompiler implements ViewEngine {
  /**
     * The handlebars renderer instance.
     */
  private readonly handlebars: typeof Handlebars

  /**
     * The view file extension.
     */
  private readonly extension: string

  /**
   * Stores the logger instance.
   */
  private readonly logger: Logger

  /**
   * Stores the handlebars config.
   */
  private readonly config: ViewConfig['handlebars']

  /**
   * Create a new renderer instance.
   *
   * @param app
   */
  constructor (logger: Logger, config: ViewConfig['handlebars']) {
    this.config = config
    this.logger = logger
    this.extension = '.hbs'
    this.handlebars = Handlebars.create()
  }

  /**
   * Returns the path to view layouts.
   *
   * @returns {string}
   */
  async layoutLocation (): Promise<string> {
    const layoutLocation = String(this.config.layouts)

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
    return this.config.defaultLayout
  }

  /**
   * Returns the path to view templates.
   *
   * @returns {string}
   */
  async viewsLocation (): Promise<string> {
    const viewsLocation = String(this.config.views)

    if (await Fs.exists(viewsLocation)) {
      return viewsLocation
    }

    throw new Error(`Path to view files not existing. Received ${viewsLocation}`)
  }

  /**
   * Returns the path to the partial views.
   *
   * @returns {string}
   */
  async partialsLocations (): Promise<string[]> {
    return await Collect(this.config.partials).filter(async path => {
      return await Fs.exists(path)
    }).all()
  }

  /**
   * Returns the path to the view helpers.
   *
   * @returns {string}
   */
  async helpersLocations (): Promise<string[]> {
    return await Collect(Path.resolve(__dirname, 'helpers'))
      .concat(this.config.helpers)
      .filter(async path => {
        return await Fs.exists(path)
      }).all()
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
    for (const partialsFolder of await this.partialsLocations()) {
      await Collect(
        await Fs.allFiles(partialsFolder)
      )
        .filter(partial => {
          return this.isViewFile(partial)
        })
        .forEach(async partial => {
          return await this.registerPartialFromFile(partial, partialsFolder)
        })
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
    return file.endsWith(this.extension)
  }

  /**
   * Register the given partial view `file` to the handlebars engine.
   *
   * @param {string} file
   */
  async registerPartialFromFile (file: string, basePath: string): Promise<void> {
    try {
      this.registerPartial(
        this.partialNameFrom(file, basePath), await Fs.content(file)
      )
    } catch (error: any) {
      this.logger.warning(`WARNING: failed to register partial "${file}": ${String(error.message)}`)
    }
  }

  /**
   * Register a partial view with the given `name` and `content` to the handlebars engine.
   *
   * @param {String} name
   * @param {String} content
   *
   * @returns {this}
   */
  registerPartial (name: string, content: string): this {
    return tap(this, () => {
      this.handlebars.registerPartial(name, content)
    })
  }

  /**
   * Determine whether a partial view with the given `name` is registered.
   *
   * @param {string} name
   */
  hasPartial (name: string): boolean {
    return !!this.handlebars.partials[name]
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
      .rtrim(this.extension)
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
      .forEach(async helper => this.registerHelperFromFile(helper))
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
   * Register a Handlebars view helper from the given file `path`.
   *
   * @param {string} path
   */
  registerHelperFromFile (path: string): void {
    const name = Fs.filename(path)
    const helper: HelperDelegate = esmResolve(require(path))

    this.registerHelper(name, helper)
  }

  /**
   * Determine whether a view helper with the given `name` is registered.
   *
   * @param {string} name
   */
  hasHelper (name: string): boolean {
    return typeof this.handlebars.helpers[name] === 'function'
  }

  /**
   * Register a view helper with the given `name` and `content` to the view engine.
   *
   * @param {string} name
   * @param {HelperDelegate} fn
   */
  registerHelper (name: string, fn: HelperDelegate): this {
    try {
      typeof fn === 'function'
        ? this.handlebars.registerHelper(name, fn)
        : this.logger.warning(`View helper "${name}" is not a function, received "${typeof fn}"`)
    } catch (error: any) {
      this.logger.warning(`WARNING: failed to load helper "${name}": ${String(error.message)}`)
    }

    return this
  }

  /**
   * Determine whether the given `view` exists.
   *
   * @param {String} view
   *
   * @returns {Boolean}
   */
  async exists (view: string): Promise<boolean> {
    const viewPath = this.ensureExtension(
      Path.resolve(await this.viewsLocation(), view)
    )

    return await Fs.exists(viewPath)
  }

  /**
   * Returns the rendered HTML view.
   *
   * @param {string} view
   * @param {*} data
   * @param {ViewConfig} viewConfig
   *
   * @returns {String}
   */
  async render (view: string, data: any, viewConfig: ViewResponseConfig = {}): Promise<string> {
    return this.hasLayout(viewConfig)
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
  private hasLayout (viewConfig: ViewResponseConfig): boolean {
    return !!this.baseLayout(viewConfig)
  }

  /**
   * Returns the base layout name. Prefers a configured layout from the
   * given `viewConfig` over a possibly configured default layout.
   *
   * @param viewConfig
   *
   * @returns {String}
   */
  private baseLayout (viewConfig: ViewResponseConfig): string {
    return viewConfig.layout ?? this.defaultLayout()
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
  async renderWithLayout (view: string, data: any, viewConfig: ViewResponseConfig): Promise<string> {
    const layout = await this.compile(this.baseLayout(viewConfig), { isLayout: true })

    const context: any = data || {}
    context.content = await this.renderView(view, data)

    return layout(context)
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
    return this.handlebars.compile(
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

    await this.ensureViewExists(view)

    return await Fs.content(
      this.ensureExtension(view)
    )
  }

  /**
   * Ensure the view file exists.
   *
   * @throws
   */
  async ensureViewExists (view: string): Promise<void> {
    const file = this.ensureExtension(view)

    if (await Fs.notExists(file)) {
      throw new Error(`View file does not exist. Tried to load ${file}`)
    }
  }

  /**
   * Appends the view file extension when needed.
   *
   * @param {String} template
   *
   * @returns {String}
   */
  ensureExtension (template: string): string {
    return Str(template).finish(this.extension).get()
  }
}

interface ReadTemplateOptions {
  isLayout?: boolean
}
