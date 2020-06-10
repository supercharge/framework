'use strict'

export type Command = new() => CommandInstance

export interface CommandInstance {
  /**
   * Returns the command signature. The command signature will be used to register the
   * console command. Ensure you're not using spaces in your command signatures.
   * Instead, use semicolons as separators, like `make:model`.
   *
   * @returns {String}
   */
  signature (): string

  /**
   * Returns the command description displayed when calling the help overview.
   *
   * @returns {String}
   */
  description (): string

  /**
   * Handle the console command.
   *
   * @param {*} parameters
   * @param {*} options
   *
   * @returns {Promise}
   */
  handle(...args: any[]): any
}
