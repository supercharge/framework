
import Bytes from 'bytes'
import { BodyparserBaseOptions } from './bodyparser-base-options.js'
import { BodyparserConfig as BodyparserConfigContract } from '@supercharge/contracts'

export class BodyparserMultipartOptions extends BodyparserBaseOptions {
  /**
   * The bodyparser multipart options object.
   */
  protected override readonly config: BodyparserConfigContract['multipart']

  /**
    * Create a new instance.
    */
  constructor (config: BodyparserConfigContract['multipart']) {
    super(config)

    this.config = config
  }

  /**
   * Returns the multipart file size limit in bytes for a single file.
   */
  maxFileSize (): number {
    return Bytes.parse(this.config.maxFileSize ?? '200mb')
  }

  /**
   * Returns the multipart file size limit in bytes for all uploaded files.
   */
  maxTotalFileSize (): number {
    return Bytes.parse(this.config.maxTotalFileSize ?? this.maxFileSize())
  }

  /**
   * Returns the maximun number of allowed fields in the multipart body.
   */
  maxFields (): number {
    return this.config.maxFields ?? 1000
  }
}
