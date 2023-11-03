
import { UploadedFile } from './uploaded-file.js'

export interface FileBag {
  /**
   * Returns an object of all uploaded files.
   */
  all(...keys: string[]): { [name: string]: UploadedFile | UploadedFile[] | undefined}

  /**
   * Returns the uploaded file for the given `name`.
   */
  get(name: string): UploadedFile | UploadedFile[] | undefined

  /**
   * Add the given file to this header bag. If there’s
   */
  add(name: string, file: UploadedFile | UploadedFile[]): this

  /**
   * Determine whether a file or list of files exists for the given `name`.
   */
  has(name: string): boolean

  /**
   * Determine whether files were uploaded on the request.
   */
  isEmpty(): boolean
}
