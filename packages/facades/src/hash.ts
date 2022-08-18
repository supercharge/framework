'use strict'

import { Facade } from './facade'

export class HashFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'hash'
  }
}
