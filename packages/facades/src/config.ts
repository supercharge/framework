'use strict'

import { Facade } from './facade'

export class ConfigFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'config'
  }
}
