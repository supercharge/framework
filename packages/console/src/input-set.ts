'use strict'

import { ConsoleInput } from './input'

export class InputSet extends Set {
  /**
   * Translate this console input to a CAC command or option input.
   *
   * @returns {String}
   */
  translateToCacInput (): string {
    return this.map((input: ConsoleInput) => {
      return input.isRequired()
        ? `${input.getName()} <${input.getName()}>`
        : `${input.getName()} [${input.getName()}]`
    }).join(' ')
  }

  /**
   * Calls the given `callback` function on each input item in the set, and
   * returns an array that contains the results.
   *
   * @param {Function} callback
   *
   * @returns {Array}
   */
  map (callback: (value: any) => any): any[] {
    const results: any[] = []

    for (const input of this.values()) {
      results.push(callback(input))
    }

    return results
  }
}
