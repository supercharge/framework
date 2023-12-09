
import { ViteConfig } from './backend/vite-config.js'
import { ServiceProvider } from '@supercharge/support'
import { ViteHandlebarsHelper } from './backend/vite-handlebars-helper.js'
import { ViewEngine, ViteConfig as ViteConfigContract } from '@supercharge/contracts'

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

    const viteConfig = ViteConfig.from(
      this.app().config().get<ViteConfigContract>('vite')
    )

    view.registerHelper('vite', (...args: any[]) => {
      return new ViteHandlebarsHelper(viteConfig, ...args).generateTags()
    })
  }
}
