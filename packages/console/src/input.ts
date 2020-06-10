'use strict'

import { tap } from '@supercharge/goodies'

export class InputArgument {
  private name: string
  private defaultValue: any
  private description: string
  private readonly options: InputArgumentOptions

  constructor (name: string = '', description: string = '', defaultValue?: any, options?: InputArgumentOptions) {
    this.name = name
    this.description = description
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
      this.name = name
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
      this.description = description
    })
  }

  /**
   * Returns the argument’s default value.
   *
   * @returns {*}
   */
  getDefault (): any {
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
}

export interface InputArgumentOptions {
  required?: boolean
  optional?: boolean
}
