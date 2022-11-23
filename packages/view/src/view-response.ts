'use strict'

import { HttpResponse, ViewBuilderCallback, ViewEngine, ViewResponseConfig } from '@supercharge/contracts'
import { ViewConfigBuilder } from './view-config-builder'

export class View {
  /**
   * Stores the HTTP response instance.
   */
  private readonly response: HttpResponse

  /**
   * Stores the view engine instance.
   */
  private readonly view: ViewEngine

  /**
   * Create a new view manager instance.
   *
   * @param {Application} app
   */
  constructor (response: HttpResponse, view: ViewEngine) {
    this.response = response
    this.view = view
  }

  /**
   * Render a view template as the response.
   *
   * @param {String} template
   * @param {*} data
   * @param {Function} callback
   *
   * @returns {String}
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
    *
    * @param {String} template
    * @param {*} data
    * @param {Function} viewBuilder
    *
    * @returns {String}
    */
  private async renderView (template: string, data?: any, viewBuilder?: ViewBuilderCallback): Promise<string> {
    const viewData = { ...this.response.state().all(), ...data }
    const viewConfig: ViewResponseConfig = {}

    if (typeof viewBuilder === 'function') {
      viewBuilder(
        new ViewConfigBuilder(viewConfig)
      )
    }

    return await this.view.render(template, viewData, viewConfig)
  }
}
