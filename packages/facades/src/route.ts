'use strict'

import { Facade } from './facade'

export class RouteFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'route'
  }
}
