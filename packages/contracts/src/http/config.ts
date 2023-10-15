
import { CookieOptions } from './cookie-options'

export interface HttpConfig {
  /**
   * The HTTP server default host address or IP. Default’s to `localhost`.
   */
  host: string

  /**
   * The local HTTP port.
   */
  port: number

  /**
   * The HTTP cookie options.
   */
  cookie: CookieOptions
}
