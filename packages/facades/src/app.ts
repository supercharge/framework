
import { Facade } from './facade.js'

export class AppFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'app'
  }
}
