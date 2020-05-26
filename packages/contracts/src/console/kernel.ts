'use strict'

export interface ConsoleKernel {
  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  handle(input: string[]): Promise<any>
}
