
import type { BinaryLike, Encoding, Hash } from 'node:crypto'

export type HasherCtor = new(...args: any[]) => Hasher

export interface Hasher {
  /**
   * Hash the given `value`.
   */
  make (value: string): Promise<string>

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  check (plain: string, hashedValue: string): Promise<boolean>

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   */
  needsRehash (hashedValue: string): boolean

  /**
   * Creates and returns a Node.js `Hash` instance for the given `algorithm`
   * and the related `input` with (optional) `inputEncoding`. When `input`
   * is a string and `inputEncoding` is omitted, it defaults to `utf8`.
   */
  createHash (algorithm: string, input: string | BinaryLike, inputEncoding?: Encoding): Hash

  /**
   * Returns an MD5 hash instance for the given `content`.
   */
  md5 (input: BinaryLike): Hash
  md5 (input: string, inputEncoding: Encoding): Hash
  md5 (input: string | BinaryLike, inputEncoding?: Encoding): Hash

  /**
   * Returns a SHA256 hash instance using SHA-2 for the given `content`.
   */
  sha256 (input: BinaryLike): Hash
  sha256 (input: string, inputEncoding: Encoding): Hash
  sha256 (input: string | BinaryLike, inputEncoding?: Encoding): Hash

  /**
   * Returns a SHA512 hash instance using SHA-2 for the given `content`.
   */
  sha512 (input: BinaryLike): Hash
  sha512 (input: string, inputEncoding: Encoding): Hash
  sha512 (input: string | BinaryLike, inputEncoding?: Encoding): Hash
}
