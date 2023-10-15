
import { ViewManager } from './manager'
import { ServiceProvider } from '@supercharge/support'
import { View as ViewResponse } from './view-response'
import { HttpResponse, HttpResponseCtor, ViewBuilderCallback } from '@supercharge/contracts'

/**
 * Add container bindings for services from this provider. Also,
 * register the `response.view` macro on the response interface.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'view': ViewManager
  }

  export interface HttpResponse {
    /**
     * Render a view template as the response.
     *
     * @example
     * ```
     * response.view('welcome')
     * response.view('welcome', view => {
     *   view.layout('landing')
     * })
     * response.view('user/dashboard', { user: { id: 1, name: 'Supercharge' } })
     * response.view('user/dashboard', { user: { id: 1, name: 'Supercharge' } }, view => {
     *   view.layout('profile')
     * })
     * ```
     */
    view (template: string, viewBuilder?: ViewBuilderCallback): Promise<this>
    view (template: string, data?: ViewBuilderCallback | any, viewBuilder?: ViewBuilderCallback): Promise<this>
  }
}

export class ViewServiceProvider extends ServiceProvider {
  /**
   * Register application services to the container.
   */
  override register (): void {
    this.app().singleton('view', () => {
      const viewConfig = this.app().config().get('view')

      return new ViewManager(this.app(), viewConfig)
    })
  }

  /**
   * Boot application services.
   */
  override async boot (): Promise<void> {
    const Response = this.app().make<HttpResponseCtor>('response')

    const view = await this.app().make('view')
    await view.boot()

    Response.macro('view', async function (this: HttpResponse, template: string, data?: ViewBuilderCallback | any, viewBuilder?: ViewBuilderCallback) {
      return await new ViewResponse(this, view).render(template, data, viewBuilder)
    })
  }
}
