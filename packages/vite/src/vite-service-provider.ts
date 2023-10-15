
import { ViewEngine } from '@supercharge/contracts'
import { ServiceProvider } from '@supercharge/support'
import { ViteHandlebarsHelper } from './vite-handlebars-helper'

export class ViteServiceProvider extends ServiceProvider {
  /**
   * Register application services.
   */
  override async boot (): Promise<void> {
    this.registerViteViewHelpers()
  }

  /**
   * Register the Vite view helper.
   */
  private registerViteViewHelpers (): void {
    const view = this.app().make<ViewEngine>('view')

    view.registerHelper('vite', (...entrypoints: string[] | string[][]) => {
      return new ViteHandlebarsHelper(this.app(), ...entrypoints).generateTags()
    })
  }
}
