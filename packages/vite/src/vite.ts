'use strict'

export type Attributes = Record<string, any>

export class Vite {
  /**
   * Stores the entrypoints.
   */
  private readonly entrypoints: string[]

  /**
   * Stores the relative path to the "build" directory.
   */
  private readonly buildDirecotry: string

  /**
   * Create a new instance.
   */
  constructor (entrypoints: string | string[], buildDirectory?: string) {
    this.entrypoints = ([] as string[]).concat(entrypoints)
    this.buildDirecotry = buildDirectory ?? 'build'

    // TODO delete me
    console.log({ entrypoints: this.entrypoints, buildDirectory: this.buildDirecotry })
  }

  /**
   * Returns a generated CSS link tag with the given `attributes` for the provided `url`.
   *
   * @param url The URL to render.
   * @param attributes
   *
   * @returns {String}
   */
  protected makeScriptTagWithAttributes (url: string, attributes: Attributes): string {
    attributes = {
      src: url,
      type: 'module',
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

  /**
   * Returns a generated CSS link tag with the given `attributes` for the provided `url`.
   *
   * @param url The URL to render.
   * @param attributes
   */
  // protected makeStylesheetTagWithAttributes (url: string, attributes: Attributes): string {
  //   //
  // }
}
