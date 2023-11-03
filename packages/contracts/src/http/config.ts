
import { CookieConfig } from './cookie-config.js'

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
  cookie: CookieConfig
}
