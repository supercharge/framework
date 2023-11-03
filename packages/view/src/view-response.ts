
import { ViewConfigBuilder } from './view-config-builder.js'
import { HttpResponse, ViewBuilderCallback, ViewEngine, ViewResponseConfig } from '@supercharge/contracts'

export class ViewResponse {
  /**
   * Stores the HTTP response instance.
   */
  private readonly response: HttpResponse

  /**
   * Stores the view engine instance.
   */
  private readonly viewEngine: ViewEngine

  /**
   * Create a new view manager instance.
   */
  constructor (response: HttpResponse, viewEngine: ViewEngine) {
    this.response = response
    this.viewEngine = viewEngine
  }

  /**
   * Render a view template as the response.
   */
  async render (template: string, dataOrViewBuilder?: ViewBuilderCallback | any): Promise<HttpResponse>
  async render (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<HttpResponse>
  async render (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<HttpResponse> {
    if (typeof data === 'function') {
      viewBuilder = data
      data = {}
    }

    return this.response.payload(
      await this.renderView(template, data, viewBuilder)
    )
  }

  /**
    * Assigns the rendered HTML of the given `template` as the response payload.
    */
  private async renderView (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<string> {
    const viewData = { ...this.response.state().all(), ...data }
    const viewConfig: ViewResponseConfig = {}

    if (typeof viewBuilder === 'function') {
      viewBuilder(
        new ViewConfigBuilder(viewConfig)
      )
    }

    return await this.viewEngine.render(template, viewData, viewConfig)
  }
}
