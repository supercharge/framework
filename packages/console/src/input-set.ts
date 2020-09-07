'use strict'

import Set from '@supercharge/set'
import { ConsoleInput } from './input'

export class InputSet extends Set<ConsoleInput> {
  /**
   * Translate this console input to a CAC command or option input.
   *
   * @returns {String}
   */
  translateToCacInput (): string {
    return this
      .map(input => {
        return input.isRequired()
          ? `<${input.getName()}>`
          : `[${input.getName()}]`
      })
      .toArray()
      .join(' ')
  }
}
