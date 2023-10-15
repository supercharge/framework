
import Fs from 'node:fs'
import Path from 'node:path'
import Str from '@supercharge/strings'
import { Arr } from '@supercharge/arrays'
import { ViteManifest } from './vite-manifest'
import { HtmlString } from '@supercharge/support'
import { Application } from '@supercharge/contracts'

export type Attributes = Record<string, any>

export class Vite {
  /**
   * Stores the application instance.
   */
  private readonly app: Application

  /**
   * Stores the entrypoints.
   */
  private readonly entrypoints: Arr<string>

  /**
   * Stores the relative path to the "build" directory.
   */
  private readonly buildDirectory: string

  /**
   * Create a new instance.
   */
  constructor (app: Application, entrypoints: string | string[], buildDirectory?: string) {
    this.app = app
    this.entrypoints = Arr.from(entrypoints)
    this.buildDirectory = Str(buildDirectory ?? 'build').start('/').get()
  }

  /**
   * Generate HTML tags for the given `entrypoints`.
   */
  static generateTags (app: Application, entrypoints: string[], buildDirectory?: string): string {
    return new this(app, entrypoints, buildDirectory).generateTags().toString()
  }

  /**
   * Generate HTML tags for the given Vite entrypoints.
   */
  generateTags (): HtmlString {
    const tags = this.hasExistingHotReloadFile()
      ? this.generateTagsForHotReload()
      : this.generateTagsFromManifest()

    return HtmlString.from(tags)
  }

  /**
   * Determine whether a hot-reload file exists. This method checks the file
   * existence synchronously because we’re using the `generateTags` method
   * in a Handlebars helper and they only support synchronous calls.
   */
  hasExistingHotReloadFile (): boolean {
    return Fs.existsSync(
      this.hotReloadFilePath()
    )
  }

  /**
   * Returns the path to the hot-reload file. The hot-reload file contains the Vite dev server URL.
   */
  hotReloadFilePath (): string {
    return this.app.publicPath('hot')
  }

  /**
   * Returns the generated HTML tags for the given `entrypoints` and Vite client.
   */
  generateTagsForHotReload (): string {
    const url = Fs.readFileSync(this.hotReloadFilePath(), 'utf8')

    return this.entrypoints
      .prepend('@vite/client')
      .map(entrypoint => {
        return this.makeTagForChunk(entrypoint, `${url}/${String(entrypoint)}`)
      })
      .join('')
  }

  /**
   * Returns the generated style and script HTML tags based on the Vite manifest.
   */
  generateTagsFromManifest (): string {
    const tags = []
    const manifest = this.manifest()

    for (const entrypoint of this.entrypoints) {
      const chunk = manifest.getChunk(entrypoint)

      tags.push(
        this.makeTagForChunk(entrypoint, `${this.buildDirectory}/${chunk.file}`)
      )

      chunk.css?.forEach(cssFile => {
        tags.push(
          this.makeTagForChunk(cssFile, `${this.buildDirectory}/${cssFile}`)
        )
      })
    }

    return tags.join('')
  }

  /**
   * Returns the path to the hot-reload file. The hot-reload file contains the Vite dev server URL.
   */
  manifestPath (): string {
    return this.app.publicPath(
      Str(this.buildDirectory).ltrim('/').get(), 'manifest.json'
    )
  }

  /**
   * Returns the parsed Vite manifest.
   */
  manifest (): ViteManifest {
    return ViteManifest.loadFrom(this.manifestPath())
  }

  /**
   * Returns a generated CSS link tag with the given `attributes` for the provided `url`.
   */
  protected makeTagForChunk (src: string, url: string): string {
    return this.isCssPath(src)
      ? this.makeStylesheetTagWithAttributes(url, {})
      : this.makeScriptTagWithAttributes(url, {})
  }

  /**
   * Determine whether the given `path` is a CSS file.
   */
  protected isCssPath (path: string): boolean {
    return Path.extname(path).match(/.(css|less|sass|scss|styl|stylus|pcss|postcss)/) != null
  }

  /**
   * Returns a generated CSS link tag for the provided `url` with given `attributes`.
   */
  protected makeStylesheetTagWithAttributes (url: string, attributes: Attributes): string {
    attributes = {
      rel: 'stylesheet',
      href: url,
      ...attributes,
    }

    return `<link ${this.attributesToString(attributes)} />`
  }

  /**
   * Returns a generated JavaScript link tag for the provided `url` with given `attributes`.
   */
  protected makeScriptTagWithAttributes (url: string, attributes: Attributes): string {
    attributes = {
      type: 'module',
      src: url,
      ...attributes,
    }

    return `<script ${this.attributesToString(attributes)}></script>`
  }

  /**
   * Returns the key="value" pairs as a string for the given `attributes`.
   */
  private attributesToString (attributes: Attributes): string {
    return Object
      .entries(attributes)
      .map(([key, value]) => `${key}="${String(value)}"`)
      .join(' ')
      .trim()
  }
}
