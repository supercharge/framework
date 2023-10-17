
import { Facade } from './facade.js'

export class LogFacade extends Facade {
  /**
   * Returns the container binding name.
   */
  override getContainerNamespace (): string {
    return 'logger'
  }
}
