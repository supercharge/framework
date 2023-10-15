
import { HttpContext } from './context.js'

export interface HttpController {
  /**
   * Handle the incoming HTTP request using the given `ctx`.
   */
  handle(ctx: HttpContext): any | Promise<any>
}
