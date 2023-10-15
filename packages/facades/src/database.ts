
import { Facade } from './facade'

export class DatabaseFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'db'
  }
}
