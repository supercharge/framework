
import { Vite } from './vite.js'
import { HelperOptions } from 'handlebars'
import { ViteConfig } from './vite-config.js'

export class ViteHandlebarsHelper {
  /**
   * Stores the Vite config instance.
   */
  private readonly viteConfig: ViteConfig

  /**
   * Stores the Vite entrypoints for which we should generate HTML tags.
   */
  private readonly entrypoints: string[]

  /**
   * The Handlebars helper options instance.
   */
  private readonly handlebarsOptions: HelperOptions

  /**
   * Create a new instance.
   */
  constructor (viteConfig: ViteConfig, ...args: any[] | any[][]) {
    this.viteConfig = viteConfig
    this.handlebarsOptions = args.pop()
    this.entrypoints = this.findEntrypoints(...args)
  }

  /**
   * Returns all configured entrypoints, from unnamed arguments or the `input` hash object.
   */
  private findEntrypoints (...args: any[]): string[] {
    const entrypoints = ([] as string[]).concat(...args)

    return entrypoints.concat(
      this.entrypointsFromOptionsHash()
    )
  }

  /**
   * Returns the configured entrypoints from the `input` hash object.
   */
  private entrypointsFromOptionsHash (): string[] {
    const input = this.handlebarsOptions.hash.input

    if (!input) {
      return []
    }

    if (typeof input === 'string') {
      return this.resolveStringInput(input)
    }

    throw new Error(`Invalid "input" value in your "vite" helper: only string values are allowed. Received "${typeof input}"`)
  }

  /**
   * Splits the given `input` at the comma character and trims each value in the result.
   */
  private resolveStringInput (input: string): string[] {
    return input
      .split(',')
      .map(entry => entry.trim())
  }

  /**
   * Generate the Vite CSS and JavaScript tags for the HTML header.
   */
  generateTags (): string {
    return Vite
      .from(this.viteConfig, this.entrypoints)
      .generateTags(
        this.attributesFromOptionsHash()
      )
      .toString()
  }

  /**
   * Returns the configured attributes from the Handlebars helper’s `attributes` hash object.
   */
  private attributesFromOptionsHash (): string {
    const attributes = this.handlebarsOptions.hash.attributes

    return typeof attributes === 'string'
      ? attributes
      : String(attributes ?? '')
  }
}
