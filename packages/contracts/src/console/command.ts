'use strict'

export interface Command {
  /**
   * Returns the command signature. The command signature will be used to register the
   * console command. Ensure you're not using spaces in your command signatures.
   * Instead, use semicolons as separators, like `make:model`.
   */
  signature (): string

  /**
   * Returns the command description displayed when calling the help overview.
   */
  description (): string

  /**
   * Handle the console command.
   *
   * @param {*} parameters
   * @param {*} options
   */
  handle(...args: any[]): Promise<any>
}
