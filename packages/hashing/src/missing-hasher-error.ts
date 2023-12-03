import { HashConfig } from '@supercharge/contracts'

export class MissingHasherError extends TypeError {
  /**
   * Create a new instance.
   */
  constructor (driver: HashConfig['driver'], message?: string) {
    super(message ?? `Missing hasher constructor for driver "${driver}"`)
  }
}
