
import Fs from 'node:fs'
import Path from 'node:path'
import { Arr } from '@supercharge/arrays'
import { ViteConfig } from './vite-config.js'
import { ViteManifest } from './vite-manifest.js'
import { HtmlString } from '@supercharge/support'
import { HotReloadFileContent } from '../plugin/types.js'

export type ViteTagAttributes = Record<string, any>

export class Vite {
  /**
   * Stores the Vite config instance.
   */
  private readonly viteConfig: ViteConfig

  /**
   * Stores the entrypoints.
   */
  private entrypoints: Arr<string>

  /**
   * Stores the cached Vite manifest file.
   */
  private manifestCache: ViteManifest | undefined

  /**
   * Create a new instance.
   */
  constructor (viteConfig: ViteConfig) {
    this.viteConfig = viteConfig
    this.entrypoints = Arr.from()
  }

  /**
   * Create a new instance with the given `viteConfig`.
   */
  static from (viteConfig: ViteConfig): Vite {
    return new this(viteConfig)
  }

  /**
   * Generate HTML tags for the given Vite entrypoints.
   */
  generateTagsFromEntrypoints (entrypoints: string | string[], userProvidedAttributes: string): HtmlString {
    this.entrypoints = Arr.from(entrypoints)

    return this.generateTags(userProvidedAttributes)
  }

  /**
   * Generate HTML tags for the given Vite entrypoints.
   */
  generateTags (userProvidedAttributes: string): HtmlString {
    const tags = this.hasExistingHotReloadFile()
      ? this.generateTagsForHotReload(userProvidedAttributes)
      : this.generateTagsFromManifest(userProvidedAttributes)

    return HtmlString.from(tags)
  }

  /**
   * Determine whether a hot-reload file exists. This method checks the file
   * existence synchronously because we’re using the `generateTags` method
   * in a Handlebars helper and they only support synchronous calls.
   */
  hasExistingHotReloadFile (): boolean {
    return Fs.existsSync(
      this.viteConfig.hotReloadFilePath()
    )
  }

  /**
   * Returns the hot-reload file content.
   */
  readHotReloadFile (): HotReloadFileContent {
    const content = Fs.readFileSync(
      this.viteConfig.hotReloadFilePath(), 'utf8'
    )

    return JSON.parse(content)
  }

  /**
   * Returns the generated HTML tags for the given `entrypoints` and Vite client.
   */
  generateTagsForHotReload (userProvidedAttributes: string): string {
    const hotfile = this.readHotReloadFile()

    return this.entrypoints
      .prepend('@vite/client')
      .map(entrypoint => {
        return this.makeTagForChunk(`${hotfile.viteDevServerUrl}/${String(entrypoint)}`, userProvidedAttributes)
      })
      .join('')
  }

  /**
   * Returns the generated style and script HTML tags based on the Vite manifest.
   */
  generateTagsFromManifest (attributes: string): string {
    const tags = Arr.from<{ path: string, tag: string }>([])
    const manifest = this.manifest()

    for (const entrypoint of this.entrypoints) {
      const chunk = manifest.getChunk(entrypoint)

      tags.push({
        tag: this.makeTagForChunk(`${this.viteConfig.assetsUrl()}/${chunk.file}`, attributes),
        path: chunk.file,
      })

      chunk.css?.forEach(cssFile => {
        tags.push({
          tag: this.makeTagForChunk(`${this.viteConfig.assetsUrl()}/${cssFile}`, attributes),
          path: cssFile
        })
      })
    }

    return tags
      .sort(tag => tag.path.endsWith('.css') ? -1 : 1) // CSS first
      .flatMap(tag => tag.tag)
      .unique()
      .join('')
  }

  /**
   * Returns the parsed Vite manifest.
   */
  manifest (): ViteManifest {
    if (this.manifestCache) {
      return this.manifestCache
    }

    this.manifestCache = ViteManifest.loadFrom(
      this.viteConfig.manifestFilePath()
    )

    return this.manifestCache
  }

  /**
   * Returns a generated CSS link tag with the given `attributes` for the provided `url`.
   */
  protected makeTagForChunk (url: string, userProvidedAttributes: string): string {
    return this.isCssPath(url)
      ? this.makeStylesheetTagWithAttributes(url, userProvidedAttributes)
      : this.makeScriptTagWithAttributes(url, userProvidedAttributes)
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
  protected makeStylesheetTagWithAttributes (url: string, userProvidedAttributes: string): string {
    const attributes = {
      href: url,
      rel: 'stylesheet',
      ...this.viteConfig.styleAttributes(),
    }

    return `<link ${this.attributesToString(attributes, userProvidedAttributes)} />`
  }

  /**
   * Returns a generated JavaScript link tag for the provided `url` with given `attributes`.
   */
  protected makeScriptTagWithAttributes (url: string, userProvidedAttributes: string): string {
    const attributes = {
      src: url,
      type: 'module',
      ...this.viteConfig.scriptAttributes(),
    }

    return `<script ${this.attributesToString(attributes, userProvidedAttributes)}></script>`
  }

  /**
   * Returns the key="value" pairs as a string for the given `attributes`.
   */
  private attributesToString (attributes: ViteTagAttributes, userProvidedAttributes: string): string {
    return Object
      .entries(attributes)
      .map(([key, value]) => `${key}="${String(value)}"`)
      .concat(userProvidedAttributes)
      .join(' ')
      .trim()
  }
}
