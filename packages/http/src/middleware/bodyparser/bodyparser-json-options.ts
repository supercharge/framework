
import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options.js'

export class BodyparserJsonOptions extends BodyparserBaseOptions {
  /**
   * Returns the JSON body size limit in bytes.
   */
  override limit (): number {
    return Bytes.parse(this.config.limit ?? '1mb')
  }
}
