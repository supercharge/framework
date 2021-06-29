'use strict'

/**
 * Push content to the beginning of an assets stack identified by the
 * given `stackName`. Check out the `stack` helper for more details.
 *
 * @param {String} stackName
 * @param {Object} context
 */
export default function prepend (stackName: string, context: any): void {
  if (!context) {
    throw new Error('Provide a name when using the "prepend" handlebars helper.')
  }

  const stacks = context.data.root.stacks || {}
  const stack = stacks[stackName] || []

  // @ts-expect-error
  stack.unshift({ mode: 'prepend', data: context.fn(this) })

  context.data.root.stacks = { ...stacks, [stackName]: stack }
}
