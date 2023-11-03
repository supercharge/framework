
import { Facade } from './facade.js'

export class DatabaseFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'db'
  }
}
