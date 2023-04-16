'use strict'

import { Vite } from './vite'
import { HelperOptions } from 'handlebars'
import { Application } from '@supercharge/contracts'

export class ViteHandlebarsHelper {
  /**
   * Stores the application instance.
   */
  private readonly app: Application

  /**
   * Stores the Vite entrypoints for which we should generate HTML tags.
   */
  private readonly entrypoints: string[]

  /**
   * The Handlebars helper options instance.
   */
  private readonly handlebarsOptions: HelperOptions

  constructor (app: Application, ...args: any[] | any[][]) {
    this.app = app
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
    return input.split(',').map(entry => {
      return entry.trim()
    })
  }

  /**
   * Generate the Vite CSS and JavaScript tags for the HTML header.
   */
  generateTags (): string {
    return Vite.generateTags(this.app, this.entrypoints)
  }
}
