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
      { --option-1 : option flag numero uno }
      { --option-2, -o : another option flag }
    `
  }

  async handle (): Promise<any> {
    return true
  }
}
