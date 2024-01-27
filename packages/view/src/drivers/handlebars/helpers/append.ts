
/**
 * Push content to the end of an assets stack identified by the given
 * `stackName`. Check out the `stack` helper for more details.
 */
export default function append (stackName: string, context: any): void {
  if (!context) {
    throw new Error('Provide a name when using the "append" handlebars helper.')
  }

  context.data.root = context.data.root ?? {}
  const stacks = context.data.root.stacks ?? {}
  const stack = stacks[stackName] ?? []

  // @ts-expect-error
  stack.push({ mode: 'append', data: context.fn(this) })

  context.data.root.stacks = { ...stacks, [stackName]: stack }
}
