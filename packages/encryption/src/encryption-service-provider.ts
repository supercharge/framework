'use strict'

import { ServiceProvider } from '@supercharge/support'
import { Encrypter } from './encrypter'

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
