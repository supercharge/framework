
import { TemplateDelegate } from 'handlebars'

/**
 * Raw block helper for templates that need
 * to handle unprocessed mustache blocks.
 *
 * For example, Vue.js uses mustache templates
 * and Handlebars would render the Vue.js tags
 * before Vue can pick them up.
 *
 * @example
 * ```
 * {{{{raw}}}}
 *   {{bar}}
 * {{{{/raw}}}}
 * ```
 *
 * will render
 *
 * ```
 * {{bar}}
 * ```
 * Find more details in the Handlebars documentation:
 * https://handlebarsjs.com/block_helpers.html#raw-blocks
 *
 */
export default function raw (options: any): TemplateDelegate {
  return options.fn()
}
