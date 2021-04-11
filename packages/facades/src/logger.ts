'use strict'

import { Facade } from './facade'

export class LogFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'logger'
  }
}
