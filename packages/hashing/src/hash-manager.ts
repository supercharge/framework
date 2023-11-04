
import type { BinaryLike, Encoding, Hash } from 'node:crypto'
import { Manager } from '@supercharge/manager'
import { Application, Hasher, HashConfig, HashBuilderCallback, HashAlgorithm } from '@supercharge/contracts'

export class HashManager extends Manager<Application> implements Hasher {
  /**
   * Returns the hashing config.
   */
  protected hashConfig (): HashConfig {
    return this.app.config().get<HashConfig>('hashing')
  }

  /**
   * Returns the default hashing driver name.
   */
  protected defaultDriver (): string {
    return this.hashConfig().driver
  }

  /**
   * Create a bcrypt hasher instance.
   */
  protected createBcryptDriver (): Hasher {
    const BcryptHasher = this.hashConfig().drivers.bcrypt

    return new BcryptHasher({
      rounds: this.app.config().get('hashing.bcrypt.rounds', 10)
    })
  }

  /**
   * Create an scrypt hasher instance.
  */
  protected createScryptDriver (): Hasher {
    const ScryptHasher = this.hashConfig().drivers.scrypt

    return new ScryptHasher(
      this.hashConfig().scrypt
    )
  }

  /**
   * Returns the driver instance. This method exists to retrieve
   * IntelliSense because of the method’s specific return value.
   */
  protected override driver (name?: string): Hasher {
    return super.driver(name)
  }

  /**
   * Hash the given `value`.
   */
  async make (value: string): Promise<string> {
    return await this.driver().make(value)
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    return await this.driver().check(plain, hashedValue)
  }

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   */
  needsRehash (hashedValue: string): boolean {
    return this.driver().needsRehash(hashedValue)
  }

  /**
   * Creates and returns a Node.js `Hash` instance for the given `algorithm`
   * and the related `input` with (optional) `inputEncoding`. When `input`
   * is a string and `inputEncoding` is omitted, it defaults to `utf8`.
   */
  createHash (algorithm: HashAlgorithm, input: string | BinaryLike, inputEncoding?: Encoding): Hash {
    return this.driver().createHash(algorithm, input, inputEncoding)
  }

  /**
   * Returns an MD5 hash instance for the given `content`.
   */
  md5 (input: BinaryLike): string
  md5 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  md5 (input: string, inputEncoding: Encoding): Hash
  md5 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    // @ts-expect-error TODO
    return this.driver().md5(input, inputEncodingOrHashBuilder)
  }

  /**
   * Returns a SHA256 hash instance using SHA-2 for the given `content`.
   */
  sha256 (input: BinaryLike): string
  sha256 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha256 (input: string, inputEncoding: Encoding): Hash
  sha256 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    // @ts-expect-error TODO
    return this.driver().sha256(input, inputEncodingOrHashBuilder)
  }

  /**
   * Returns a SHA512 hash instance using SHA-2 for the given `content`.
   */
  sha512 (input: BinaryLike): string
  sha512 (input: BinaryLike, hashBuilder: HashBuilderCallback): string
  sha512 (input: string, inputEncoding: Encoding): Hash
  sha512 (input: string | BinaryLike, inputEncodingOrHashBuilder?: Encoding | HashBuilderCallback): Hash | string {
    // @ts-expect-error TODO
    return this.driver().sha512(input, inputEncodingOrHashBuilder)
  }
}
