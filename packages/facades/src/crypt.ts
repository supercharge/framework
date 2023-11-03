
import { Facade } from './facade.js'

export class CryptFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'encrypter'
  }
}
