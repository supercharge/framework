'use strict'

import { Files } from 'formidable'
import { tap } from '@supercharge/goodies'
import { UploadedFile } from './uploaded-file'
import { FileBag as FileBagContract } from '@supercharge/contracts'

export class FileBag implements FileBagContract {
  /**
   * Stores the files on the request.
   */
  private readonly files: { [name: string]: UploadedFile | UploadedFile[] }

  /**
   * Create a new instance.
   */
  constructor (files: { [name: string]: UploadedFile | UploadedFile[]}) {
    this.files = files
  }

  /**
   * Convert the given `files` to Supercharge uploaded file instances.
   *
   * @param {Files} files
   *
   * @returns {FileBag}
   */
  static createFromBase (files?: Files): FileBag {
    return new this(
      Object.entries(files ?? {}).reduce((carry: { [key: string]: UploadedFile | UploadedFile[] }, [name, value]) => {
        carry[name] = Array.isArray(value)
          ? value.map(file => new UploadedFile(file))
          : new UploadedFile(value)

        return carry
      }, {})
    )
  }

  /**
   * Returns an object of all uploaded files.
   */
  all (...keys: string[]): { [name: string]: UploadedFile | UploadedFile[] | undefined} {
    if (keys.length === 0) {
      return this.files
    }

    return keys.reduce((carry: { [name: string]: UploadedFile | UploadedFile[] | undefined }, key: string) => {
      carry[key] = this.get(key)

      return carry
    }, {})
  }

  /**
   * Returns the uploaded file or file array  for the given `name`. Returns
   * `undefined` if no file exists on the request for the given `name`.
   *
   * @param {String} name
   *
   * @returns {UploadedFile|UploadedFile[]|undefined}
   */
  get (name: string): UploadedFile | UploadedFile[] | undefined {
    return this.files[name]
  }

  /**
   * A a file header for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   *
   * @param {String} name
   * @param {UploadedFile|UploadedFile[]} value
   *
   * @returns {this}
   */
  add (name: string, value: UploadedFile | UploadedFile[]): this {
    return tap(this, () => {
      this.files[name] = value
    })
  }

  /**
   * Determine whether the HTTP header for the given `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  has (name: string): boolean {
    return !!this.get(name)
  }

  /**
   * Returns an object containing all files in the bag.
   */
  toJSON (): { [name: string]: UploadedFile | UploadedFile[] | undefined} {
    return this.all()
  }
}
