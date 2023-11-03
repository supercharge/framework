
import { Command } from './command.js'

export class TestCommand extends Command {
  /**
   * Returns the command signature.
   */
  static signature (): string {
    return `
      make:model
      { file : this part after the colon is an argument description }
      { name? : this is an optional argument }
      { --target? : optional option, parsed as boolean }
      { --option-1 : optional option, parsed as boolean }
      { --no-config : negated optional option with alias, parsed as boolean and false by default because of the “no-" prefix }
      { --source= : required option and a value must be passed down when calling this command }
    `
  }

  override async handle (): Promise<any> {
    return true
  }
}
