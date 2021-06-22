'use strict'

import { Facade } from './facade'

export class DatabaseFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'db'
  }
}
