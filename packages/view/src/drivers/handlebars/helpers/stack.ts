
/**
 * Stacks are like portals and allow to inject content into a section
 * in a layout or view from a different view (like a partial).
 *
 * @example
 * ```
 * {{#stack "scripts"}}
 *   <link href="#"> … this is the default content of this stack
 * {{/stack}}
 * ```
 */
export default function stack (name: string, context: any): string {
  if (!context) {
    throw new Error('Provide a name when using the "stack" handlebars helper.')
  }

  const data = context.data.root ?? {}
  const stacks = data.stacks ?? {}
  const stack = stacks[name] ?? []

  const content = stack
    .reduce((carry: string[], { mode, data }: { mode: string, data: string }) => {
      if (mode === 'append') {
        carry.push(data)
      }

      if (mode === 'prepend') {
        carry.unshift(data)
      }

      return carry
      // @ts-expect-error
    }, [context.fn(this)])
    .join('')

  return content
}
