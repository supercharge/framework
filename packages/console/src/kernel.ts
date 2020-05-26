'use strict'

import { ConsoleKernel as ConsoleKernelContract } from '@supercharge/contracts'

export class Kernel implements ConsoleKernelContract {
  /**
   * Handle an incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  async handle (input: string[]): Promise<any> {
    // TODO
  }
}
