
import { HashManager } from './hash-manager.js'
import { ServiceProvider } from '@supercharge/support'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'hash': HashManager
  }
}

export class HashingServiceProvider extends ServiceProvider {
  /**
   * Register the hash manager into the container.
   */
  override register (): void {
    this.registerHashManager()
  }

  /**
   * Register the encrypter instance.
   */
  protected registerHashManager (): void {
    this.app().singleton('hash', () => {
      return new HashManager(this.app())
    })
  }
}
