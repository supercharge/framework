
import { Facade } from './facade.js'

export class HashFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'hash'
  }
}
