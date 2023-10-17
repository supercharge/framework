
import { Facade } from './facade.js'

export class ConfigFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'config'
  }
}
