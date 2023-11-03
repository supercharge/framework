
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
   */
  constructor (options: BodyparserBaseOptionsContract = { contentTypes: [] }) {
    this.config = options
  }

  /**
   * Returns the JSON body size limit in bytes.
   */
  limit (): number {
    return Bytes.parse(this.config.limit ?? '56kb')
  }

  /**
   * Returns the allowed JSON content types
   */
  contentTypes (): string[] {
    return Set
      .from(this.config.contentTypes)
      .map(contentType => contentType.toLowerCase())
      .toArray()
  }
}
