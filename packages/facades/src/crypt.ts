'use strict'

import { Facade } from './facade'

export class CryptFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'encrypter'
  }
}
