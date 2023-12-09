
import { Vite } from './backend/vite.js'
import { ViteConfig } from './backend/vite-config.js'
import { ServiceProvider } from '@supercharge/support'
import { ViteHandlebarsHelper } from './backend/vite-handlebars-helper.js'
import { ViewEngine, ViteConfig as ViteConfigContract } from '@supercharge/contracts'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'vite': Vite
  }
}

export class ViteServiceProvider extends ServiceProvider {
  /**
   * Register application services.
   */
  override async boot (): Promise<void> {
    this.registerVite()
    this.registerViteViewHelpers()
  }

  /**
   * Register the Vite binding.
   */
  private registerVite (): void {
    this.app().singleton('vite', () => {
      const config = this.app().config().get<ViteConfigContract>('vite')
      const viteConfig = ViteConfig.from(config)

      return Vite.from(viteConfig)
    })
  }

  /**
   * Register the Vite view helper.
   */
  private registerViteViewHelpers (): void {
    const vite = this.app().make('vite')
    const view = this.app().make<ViewEngine>('view')

    view.registerHelper('vite', (...args: any[]) => {
      return new ViteHandlebarsHelper(vite, ...args).generateTags()
    })
  }
}
