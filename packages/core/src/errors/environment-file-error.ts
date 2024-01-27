
import { Error } from '@supercharge/errors'

export class EnvironmentFileError extends Error {
  /**
   * Create a new error instance.
   */
  constructor (message: string, cause?: any) {
    super(message, { cause })
  }
}
