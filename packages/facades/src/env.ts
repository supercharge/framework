
import { Facade } from './facade.js'

export class EnvFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'env'
  }
}
