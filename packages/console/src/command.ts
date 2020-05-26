'use strict'

import { ConsoleCommand as ConsoleCommandContract } from '@supercharge/contracts'

export abstract class Command implements ConsoleCommandContract {
  /**
   * Returns the command name. The command name will be used to register the
   * console command. Ensure you're not using spaces in your command names.
   * Instead, use semicolons as separators, like `make:model`.
   *
   * @returns {String}
   */
  abstract name(): string

  /**
   * Returns the command description displayed when calling the help overview.
   *
   * @returns {String}
   */
  abstract description(): string

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  abstract handle (input: string[]): Promise<any>
}
