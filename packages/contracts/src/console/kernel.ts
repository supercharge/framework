'use strict'

export interface ConsoleKernel {
  /**
   * Bootstrap the console application to handle Craft commands.
   */
  bootstrap(): Promise<void>

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   */
  run(input?: string[]): Promise<any>
}
