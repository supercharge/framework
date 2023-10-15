
import { Facade } from './facade'

export class AppFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'app'
  }
}
