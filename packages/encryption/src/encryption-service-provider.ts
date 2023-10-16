
import { Encrypter } from './encrypter.js'
import { ServiceProvider } from '@supercharge/support'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'encrypter': Encrypter
    'encryption': ContainerBindings['encrypter']
  }
}

export class EncryptionServiceProvider extends ServiceProvider {
  /**
   * Register the encrypter into the container.
   */
  override register (): void {
    this.registerEncrypter()
  }

  /**
   * Register the encrypter instance.
   */
  protected registerEncrypter (): void {
    this.app()
      .singleton('encrypter', () => {
        return new Encrypter({ key: this.config().get('app.key') })
      })
      .alias('encrypter', 'encryption')
  }
}
