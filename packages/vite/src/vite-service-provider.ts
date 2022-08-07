'use strict'

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

    // TODO
    view.registerHelper('vite', (...entrypoints: string[] | string[][]) => {
      console.log({ entrypoints })
    })
  }
}
