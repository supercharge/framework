
import { Facade } from './facade'

export class ConfigFacade extends Facade {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  override getContainerNamespace (): string {
    return 'config'
  }
}
