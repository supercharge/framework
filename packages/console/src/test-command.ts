'use strict'

import { Command } from './command'

export class TestCommand extends Command {
  /**
   * Returns the command signature.
   */
  static signature (): string {
    return `
      make:model
      { file : the model name }
      { --option-1 : optional option, parsed as boolean }
      { --option-2, -o : optional option with alias, parsed as boolean }
      { --source=<dir> : optional option, will be assigned the given default value }
      { --target? : optional option, parsed as boolean }
    `
  }

  async handle (): Promise<any> {
    return true
  }
}
