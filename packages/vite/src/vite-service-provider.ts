'use strict'

import { ViewEngine } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'

export class ViteServiceProvider extends ServiceProvider {
  /**
   * Register application services.
   */
  override register (): void {
    super.register()
    this.registerViteViewHelpers()
  }

  /**
   * Register the Vite view helper.
   */
  private registerViteViewHelpers (): void {
    const view = this.app().make<ViewEngine>('view')

    // TODO
    // @ts-expect-error view.registerHelper is not available yet!
    view.registerHelper('vite', () => {
      //
    })
  }
}
