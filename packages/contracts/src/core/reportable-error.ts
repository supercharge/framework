
import { HttpContext } from '../index.js'

export interface ReportableError extends Error {
  /**
   * Report an error, to a 3rd-party service, the console, a file, or somewhere else.
   */
  report(error: Error, ctx: HttpContext): Promise<any> | any
}
