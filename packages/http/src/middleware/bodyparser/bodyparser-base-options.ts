
import Bytes from 'bytes'
import Set from '@supercharge/set'

interface BodyparserBaseOptionsContract {
  limit?: number | string
  contentTypes: string[]
  maxFileSize?: number | string
}

export class BodyparserBaseOptions {
  /**
   * The bodyparser base options object.
   */
  protected readonly config: BodyparserBaseOptionsContract

  /**
   * Create a new instance.
   *
   * @param {BodyparserBaseOptionsContract} options
   */
  constructor (options: BodyparserBaseOptionsContract = { contentTypes: [] }) {
    this.config = options
  }

  /**
   * Returns the JSON body size limit in bytes.
   *
   * @returns {String|Number}
   */
  limit (): number {
    return Bytes.parse(this.config.limit ?? '56kb')
  }

  /**
   * Returns the allowed JSON content types
   *
   * @returns {String[]}
   */
  contentTypes (): string[] {
    return Set
      .from(this.config.contentTypes)
      .map(contentType => contentType.toLowerCase())
      .toArray()
  }
}
