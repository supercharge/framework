'use strict'

import { Facade } from './facade'

export class EnvFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'env'
  }
}
