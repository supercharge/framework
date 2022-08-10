'use strict'

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
  private readonly buildDirecotry: string

  /**
   * Create a new instance.
   */
  constructor (app: Application, entrypoints: string | string[], buildDirectory?: string) {
    this.app = app
    this.entrypoints = Arr.from(entrypoints)
    this.buildDirecotry = Str(buildDirectory ?? 'build').start('/').get()
  }

  /**
   * Generate HTML tags for the given `entrypoints`.
   *
   * @param entrypoints The entrypoints to handle.
   * @param buildDirectory
   *
   * @returns {Vite}
   */
  static generateTags (app: Application, entrypoints: string[], buildDirectory?: string): string {
    return new this(app, entrypoints, buildDirectory).generateTags().toString()
  }

  /**
   * Generate HTML tags for the given Vite entrypoints.
   *
   * @returns {String}
   */
  generateTags (): HtmlString {
    return this.hasExistingHotReloadFile()
      ? this.generateTagsForHotReload()
      : this.generateTagsFromManifest()
  }

  /**
   * Determine whether a hot-reload file exists.
   *
   * @returns {Boolean}
   */
  hasExistingHotReloadFile (): boolean {
    return Fs.existsSync(this.hotReloadFilePath())
  }

  /**
   * Returns the path to the hot-reload file. The hot-reload file contains the Vite dev server URL.
   *
   * @returns {String}
   */
  hotReloadFilePath (): string {
    return this.app.publicPath('hot')
  }

  /**
   * Returns the generated HTML tags for the given `entrypoints` and Vite client.
   *
   * @returns {HtmlString}
   */
  generateTagsForHotReload (): HtmlString {
    const url = Fs.readFileSync(this.hotReloadFilePath(), 'utf8')

    const tags = this.entrypoints
      .prepend('@vite/client')
      .map(entrypoint => {
        return this.makeTagForChunk(entrypoint, `${url}/${String(entrypoint)}`)
      })
      .join('')

    return HtmlString.from(tags)
  }

  /**
   * Returns the generated style and script HTML tags based on the Vite manifest.
   */
  generateTagsFromManifest (): HtmlString {
    const tags = []
    const manifest = this.manifest()

    for (const entrypoint of this.entrypoints.toArray()) {
      manifest.ensureEntrypoint(entrypoint)

      const chunk = manifest.getChunk(entrypoint)!

      tags.push(this.makeTagForChunk(entrypoint, `${this.buildDirecotry}/${chunk.file}`))

      chunk.css?.forEach(cssFile => {
        tags.push(this.makeTagForChunk(entrypoint, `${this.buildDirecotry}/${cssFile}`))
      })
    }

    return HtmlString.from(tags.join(''))
  }

  /**
   * Returns the path to the hot-reload file. The hot-reload file contains the Vite dev server URL.
   *
   * @returns {String}
   */
  manifestPath (): string {
    return this.app.publicPath(Str(this.buildDirecotry).ltrim('/').get(), 'manifest.json')
  }

  /**
   * Returns the parsed Vite manifest.
   */
  manifest (): ViteManifest {
    return ViteManifest.loadFrom(this.manifestPath())
  }

  /**
   * Returns a generated CSS link tag with the given `attributes` for the provided `url`.
   *
   * @param url The URL to render.
   * @param attributes
   *
   * @returns {String}
   */
  protected makeTagForChunk (src: string, url: string): string {
    // console.log({ src })

    return this.isCssPath(src)
      ? this.makeStylesheetTagWithAttributes(url, {})
      : this.makeScriptTagWithAttributes(url, {})
  }

  /**
   * Determine whether the given `path` is a CSS file.
   *
   * @param {String} path
   *
   * @returns {Boolean}
   */
  protected isCssPath (path: string): boolean {
    return Path.extname(path).match(/.(css|less|sass|scss|styl|stylus|pcss|postcss)/) != null
  }

  /**
   * Returns a generated CSS link tag for the provided `url` with given `attributes`.
   *
   * @param url
   * @param attributes
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
   *
   * @param url
   * @param attributes
   *
   * @returns {String}
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
   *
   * @param attributes
   *
   * @returns {String}
   */
  private attributesToString (attributes: Attributes): string {
    return Object
      .entries(attributes)
      .map(([key, value]) => `${key}="${String(value)}"`)
      .join(' ')
      .trim()
  }
}
