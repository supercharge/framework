
import { Facade } from './facade'

export class EnvFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'env'
  }
}
