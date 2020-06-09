'use strict'

export interface ConsoleCommand {
  /**
   * Handle the console command.
   *
   * @param {Array} parameters
   * @param {Array} options
   *
   * @returns {Promise}
   */
  handle(parameters: any[], options: any[]): Promise<any>
}
