'use strict'

import { tap } from '@supercharge/goodies'

export class ConsoleInput {
  /**
   * The argument or option name.
   */
  private name: string

  /**
   * The argument’s or option’s default value.
   */
  private defaultValue: any

  /**
   * The argument or option description.
   */
  private description: string

  /**
   * The option defining whether the input is optional or required.
   */
  private readonly options: InputArgumentOptions

  constructor (name: string = '', description: string = '', defaultValue?: any, options?: InputArgumentOptions) {
    this.name = name.trim()
    this.description = description.trim()
    this.defaultValue = defaultValue
    this.options = options ?? { optional: true }
  }

  /**
   * Returns the argument name.
   *
   * @returns {String}
   */
  getName (): string {
    return this.name
  }

  /**
   * Set the description.
   *
   * @param name
   *
   * @returns {InputArgument}
   */
  setName (name: string): this {
    return tap(this, () => {
      this.name = name.trim()
    })
  }

  /**
   * Returns the argument name.
   *
   * @returns {String}
   */
  getDescription (): string {
    return this.description
  }

  /**
   * Set the description.
   *
   * @param description
   *
   * @returns {InputArgument}
   */
  setDescription (description: any): this {
    return tap(this, () => {
      this.description = description.trim()
    })
  }

  /**
   * Returns the argument’s default value.
   *
   * @returns {*}
   */
  getDefaultValue (): any {
    return this.defaultValue
  }

  /**
   * Set the default value.
   *
   * @param value
   *
   * @returns {InputArgument}
   */
  setDefaultValue (value: any): this {
    return tap(this, () => {
      this.defaultValue = value
    })
  }

  /**
   * Returns `true` if the argument is optional.
   *
   * @returns {Boolean}
   */
  isOptional (): boolean {
    return this.options.optional ?? false
  }

  /**
   * Returns `true` if the argument is required.
   *
   * @returns {Boolean}
   */
  isRequired (): boolean {
    return this.options.required ?? false
  }

  /**
   * Mark the argument as required.
   *
   * @returns {InputArgument}
   */
  markAsRequired (): this {
    return tap(this, () => {
      this.options.required = true
      this.options.optional = false
    })
  }

  /**
   * Mark the argument as optional.
   *
   * @returns {InputArgument}
   */
  markAsOptional (): this {
    return tap(this, () => {
      this.options.optional = true
      this.options.required = false
    })
  }

  /**
   * Translate this console input to a CAC command or option input.
   *
   * @returns {String}
   */
  translateToCacInput (): string {
    return this.isRequired()
      ? `${this.getName()} <${this.getName()}>`
      : `${this.getName()} [${this.getName()}]`
  }
}

export interface InputArgumentOptions {
  required?: boolean
  optional?: boolean
}
