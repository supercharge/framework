
import { Files } from 'formidable'
import { tap } from '@supercharge/goodies'
import { UploadedFile } from './uploaded-file.js'
import { FileBag as FileBagContract } from '@supercharge/contracts'

interface UploadedFileType {
  [name: string]: UploadedFile | UploadedFile[]
}

export class FileBag implements FileBagContract {
  /**
   * Stores the files on the request.
   */
  private readonly files: UploadedFileType

  /**
   * Create a new instance.
   */
  constructor (files: UploadedFileType = {}) {
    this.files = files
  }

  /**
   * Convert the given `files` to Supercharge uploaded file instances.
   */
  static createFromBase (files?: Files): FileBag {
    const uploadedFiles = Object
      .entries(files ?? {})
      .reduce((carry: UploadedFileType, [filename, file]) => {
        if (file == null) {
          return carry
        }

        if (Array.isArray(file)) {
          carry[filename] = file.length === 1
            ? new UploadedFile(file.pop() as any)
            : file.map(file => new UploadedFile(file))
        } else {
          carry[filename] = new UploadedFile(file as any)
        }

        return carry
      }, {})

    return new this(uploadedFiles)
  }

  /**
   * Returns an object of all uploaded files.
   */
  all (...keys: string[] | string[][]): { [name: string]: UploadedFile | UploadedFile[] | undefined } {
    if (keys.length === 0) {
      return this.files
    }

    return ([] as string[])
      .concat(...keys)
      .reduce((carry: { [name: string]: UploadedFile | UploadedFile[] | undefined }, key: string) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
   * Returns the uploaded file or file array  for the given `name`. Returns
   * `undefined` if no file exists on the request for the given `name`.
   */
  get (name: string): UploadedFile | UploadedFile[] | undefined {
    return this.files[name]
  }

  /**
   * A a file header for the given `name` and assign the `value`.
   * This will override an existing header for the given `name`.
   */
  add (name: string, value: UploadedFile | UploadedFile[]): this {
    return tap(this, () => {
      this.files[name] = value
    })
  }

  /**
   * Determine whether the HTTP header for the given `name` exists.
   */
  has (name: string): boolean {
    return !!this.get(name)
  }

  /**
   * Determine whether files were uploaded on the request.
   */
  isEmpty (): boolean {
    return Object.keys(this.files).length === 0
  }

  /**
   * Returns an object containing all files in the bag.
   */
  toJSON (): UploadedFileType {
    return this.all() as UploadedFileType
  }
}
