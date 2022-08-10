'use strict'

import { Vite } from './vite'
import { ViewEngine } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'

export class ViteServiceProvider extends ServiceProvider {
  /**
   * Register application services.
   */
  override register (): void {
    this.registerViteViewHelpers()
  }

  /**
   * Register the Vite view helper.
   */
  private registerViteViewHelpers (): void {
    const view = this.app().make<ViewEngine>('view')

    view.registerHelper('vite', (...entrypoints: string[] | string[][]) => {
      const entries = ([] as string[])
        .concat(...entrypoints)
        .slice(0, -1) // the last entry is the Handlebars "options" context object. We’re slicing that off from the rest parameter.

      return Vite.generateTags(this.app(), entries)
    })
  }
}
