
import { Facade } from './facade.js'

export class RouteFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'route'
  }
}
