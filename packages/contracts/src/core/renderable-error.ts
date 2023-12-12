import { HttpContext } from '../index.js'

export interface RenderableError extends Error {
  /**
   * Render an error into an HTTP response.
   */
  render(error: Error, ctx: HttpContext): Promise<any> | any
}
