'use strict'

import { Command as CommandContract } from '@supercharge/contracts'

export class Command implements CommandContract {
  /**
   * Returns the command signature. The command signature will be used to register the
   * console command. Ensure you're not using spaces in your command signatures.
   * Instead, use semicolons as separators, like `make:model`.
   *
   * @returns {String}
   */
  signature (): string {
    throw new Error(`You must implement the "signature" method in your "${this.constructor.name}" command`)
  }

  /**
   * Returns the command description displayed when calling the help overview.
   *
   * @returns {String}
   */
  description (): string {
    return ''
  }

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @returns {Promise}
   */
  async handle (..._inputs: any[]): Promise<any> {
    throw new Error(`You must implement the "handle" method in your "${this.constructor.name}" command`)
  }
}
