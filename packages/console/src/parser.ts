'use strict'

// import Str from '@supercharge/strings'
// import { InputSet } from './input-set'
// import { ConsoleInput } from './input'
// import { upon } from '@supercharge/goodies'

export class Parser {
//   /**
//    * Parse the given console command `signature` into an object.
//    *
//    * @param {String} signature
//    *
//    * @returns {String}
//    */
//   static parse (signature: string): ParsedSignature {
//     const name = this.commandName(signature)
//     const { parameters, options } = this.inputs(signature)

  //     return { name, parameters, options }
  //   }

  //   /**
  //    * Extract the console command name from the given `signature`.
  //    *
  //    * @param {String} signature
  //    *
  //    * @returns {String}
  //    */
  //   static commandName (signature: string): string {
  //     const matches = signature.match(/[^\s]+/)

  //     if (matches) {
  //       return matches[0]
  //     }

  //     throw new Error('Cannot determine command name from signature')
  //   }

  //   /**
  //    * Extract all input tokens (arguments and options) from the given `signature`.
  //    *
  //    * @param {String} signature
  //    *
  //    * @returns {Object}
  //    */
  //   static inputs (signature: string): { parameters: InputSet, options: InputSet} {
  //     const options = new InputSet()
  //     const parameters = new InputSet()

  //     /**
  //      * The following Regex matches all tokens in the signature surrounded by
  //      * curly brackets. For example, it matches the parameters `{to}` and
  //      * `{--use-queue}` in the signature `send:mail {to} {--use-queue}.
  //      */
  //     const matches = signature.matchAll(/{(-*.[^}]+)}/g)

  //     for (const match of matches) {
  //       const token = match[1] // the token without curly brackets

  //       token.trim().startsWith('--')
  //         ? options.add(this.parseOption(token))
  //         : parameters.add(this.parseArgument(token))
  //     }

  //     return { parameters, options }
  //   }

  //   /**
  //    * Parse the given `input` into an option.
  //    *
  //    * @param {String} input
  //    *
  //    * @returns {*}
  //    */
  //   static parseOption (input: string): any {
  //     const [token, description] = this.extractDescription(input)

  //     switch (true) {
  //       case Str(token).endsWith('?'):
  //         return this.createOptionalArgument(
  //           Str(token).rtrim('?').get(), description
  //         )

  //       case this.hasDefaultValue(token):
  //         return this.createOptionalArgument(
  //           this.extractName(token), description, this.extractDefaultValue(token)
  //         )

  //       case Str(token).endsWith('='):
  //         return this.createRequiredArgument(
  //           Str(token).rtrim('=').get(), description
  //         )

  //       default:
  //         return this.createOptionalArgument(token, description)
  //     }
  //   }

  //   /**
  //    * Parse the given `input` into an argument.
  //    *
  //    * @param {String} input
  //    *
  //    * @returns {*}
  //    */
  //   static parseArgument (input: string): ConsoleInput {
  //     const [token, description] = this.extractDescription(input)

  //     switch (true) {
  //       case Str(token).endsWith('?'):
  //         return this.createOptionalArgument(
  //           Str(token).rtrim('?').get(), description
  //         )

  //       case this.hasDefaultValue(token):
  //         return this.createOptionalArgument(
  //           this.extractName(token), description, this.extractDefaultValue(token)
  //         )

  //       default:
  //         return this.createRequiredArgument(token, description)
  //     }
  //   }

  //   /**
  //    * Create an optional input argument.
  //    *
  //    * @param {String} name
  //    * @param {String} description
  //    * @param {*} defaultValue
  //    *
  //    * @returns {ConsoleInput}
  //    */
  //   static createOptionalArgument (name: string, description: string, defaultValue?: any): ConsoleInput {
  //     return new ConsoleInput()
  //       .setName(name)
  //       .setDescription(description)
  //       .setDefaultValue(defaultValue)
  //       .markAsOptional()
  //   }

  //   /**
  //    * Create a required input argument.
  //    *
  //    * @param {String} name
  //    * @param {String} description
  //    * @param {*} defaultValue
  //    *
  //    * @returns {ConsoleInput}
  //    */
  //   static createRequiredArgument (name: string, description: string, defaultValue?: any): ConsoleInput {
  //     return new ConsoleInput()
  //       .setName(name)
  //       .setDescription(description)
  //       .setDefaultValue(defaultValue)
  //       .markAsRequired()
  //   }

  //   /**
  //    * Determine whether the given argument or option has a default value.
  //    *
  //    * @param {String} token
  //    *
  //    * @returns {Boolean}
  //    */
  //   static hasDefaultValue (token: string): boolean {
  //     return /(.+)=(.+)/.test(token)
  //   }

  //   /**
  //    * Parse the given `token` into the pair of argument name and description.
  //    *
  //    * @param {String} token
  //    *
  //    * @returns {Array}
  //    */
  //   static extractName (token: string): string {
  //     return upon(token.match(/(.+)=(.+)/) ?? [], matches => {
  //       return matches[1]
  //     })
  //   }

  //   /**
  //    * Parse the given `token` into the pair of argument name and description.
  //    *
  //    * @param {String} token
  //    *
  //    * @returns {Array}
  //    */
  //   static extractDescription (token: string): string[] {
  //     return token.includes(':')
  //       ? token.split(':')
  //       : [token, '']
  //   }

  //   /**
  //    * Parse the given `token` into the pair of argument name and description.
  //    *
  //    * @param {String} token
  //    *
  //    * @returns {Array}
  //    */
  //   static extractDefaultValue (token: string): any {
  //     return upon(token.match(/(.+)=(.+)/) ?? [], matches => {
  //       return matches[2]
  //     })
  //   }
}

// export interface ParsedSignature {
//   /**
//    * The command name.
//    */
//   name: string

//   /**
//    * The command parameters (arguments).
//    */
//   parameters: InputSet

//   /**
//    * The command options (flags).
//    */
//   options: InputSet
// }
