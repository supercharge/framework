
import { Facade } from './facade.js'

export class ViewFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'view'
  }
}
