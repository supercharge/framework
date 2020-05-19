'use strict'

import { Logger as LoggingContract } from '@supercharge/contracts'

export class ConsoleLogger implements LoggingContract {
  /**
   * The maximum log level.
   */
  private readonly level: string = 'debug'

  constructor (options: any) {
    this.level = options.level || this.level
  }

  // TODO
}
