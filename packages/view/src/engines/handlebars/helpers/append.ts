'use strict'

/**
 * Push content to the end of an assets stack identified by the given
 * `stackName`. Check out the `stack` helper for more details.
 *
 * @param {String} stackName
 * @param {Object} context
 */
export default function append (stackName: string, context: any): void {
  if (!context) {
    throw new Error('Provide a name when using the "append" handlebars helper.')
  }

  const stacks = context.data.root.stacks || {}
  const stack = stacks[stackName] || []

  // @ts-expect-error
  stack.push({ mode: 'append', data: context.fn(this) })

  stacks[stackName] = stackName
  context.data.root.stacks = stacks
}
