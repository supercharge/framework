'use strict'

export interface ConsoleCommand {
  /**
   * Returns the command name. The command name will be used to register the
   * console command. Ensure you're not using spaces in your command names.
   * Instead, use semicolons as separators, like `make:model`.
   *
   * @returns {String}
   */
  name(): string

  /**
   * Returns the command description displayed when calling the help overview.
   *
   * @returns {String}
   */
  description(): string

  /**
   * Handle the console command.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  handle(input: any[]): Promise<any>
}
