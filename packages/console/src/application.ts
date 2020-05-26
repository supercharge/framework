'use strict'

import { CAC } from 'cac'
import { ConsoleApplication as ConsoleApplicationContract } from '@supercharge/contracts'

export class Application extends CAC implements ConsoleApplicationContract {
  constructor (version: string) {
    super(`Supercharge Framework ${version}`)
  }

  /**
   * Runs the incoming console command for the given `input`.
   *
   * @param {Array} input - command line arguments (argv)
   *
   * @returns {Promise}
   */
  async run (input: string[]): Promise<any> {
    // TODO
  }
}
