
import { SessionConfig } from '@supercharge/contracts'

export class SessionCookieConfig {
  /**
   * Stores the session cookie configuration.
   */
  private readonly config: SessionConfig['cookie']

  /**
   * Create a new session instance.
   */
  constructor (config: SessionConfig['cookie']) {
    this.config = config
  }

  /**
   * Returns the session cookie config as a plain JavaScript object.
   */
  plain (): SessionConfig['cookie'] {
    return this.config
  }

  /**
   * Returns the session cookie path.
   */
  path (): string {
    return this.config.path ?? '/'
  }

  /**
   * Stores the session cookie domain.
   */
  domain (): string {
    return this.config.domain ?? ''
  }

  /**
   * Determine whether the session cookie is only to be sent over HTTPS.
   */
  isSecure (): boolean {
    return this.config.secure ?? false
  }

  /**
   * Determine whether the session cookie is only available
   * through the HTTP protocol and not from JavaScript.
   */
  httpOnly (): boolean {
    return this.config.httpOnly ?? true
  }

  /**
   * Determine whether the session cookie is sent along with cross-site requests.
   */
  sameSite (): string {
    const sameSite = this.config.sameSite

    if (typeof sameSite === 'string') {
      return this.sameSiteFrom(sameSite)
    }

    if (typeof sameSite === 'boolean') {
      return sameSite ? 'strict' : 'none'
    }

    throw new Error(`Session cookie "sameSite" attribute must be a string or boolean. Received "${sameSite}". Configure it in your "config/session.ts" file.`)
  }

  /**
   * Returns the sameSite value.
   */
  private sameSiteFrom (sameSite: string): string {
    const isValid = ['strict', 'lax', 'none'].includes(sameSite)

    if (isValid) {
      return sameSite
    }

    throw new Error(`Invalid sameSite value. Received "${sameSite}". Configure it in your "config/session.ts" file.`)
  }
}
