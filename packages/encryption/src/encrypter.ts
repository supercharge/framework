
import JSON from '@supercharge/json'
import { Str } from '@supercharge/strings'
import { Encrypter as EncryptionContract } from '@supercharge/contracts'
import { createCipheriv, createDecipheriv, createHmac } from 'node:crypto'

export interface EncrypterOptions {
  /**
   * The encryption key used to encrypt and decrypt values.
   */
  key: string

  /**
   * The encryption algorithm. Defaults to `aes-256-cbc`.
   */
  algorithm?: string
}

export class Encrypter implements EncryptionContract {
  /**
   * Stores the secret key used as the secret to encrypt and decrypt values.
   */
  private readonly key: string

  /**
   * Stores the algorithm to encrypt and decrypt values.
   */
  private readonly algorithm: string

  /**
   * Create a new instance.
   */
  constructor ({ key, algorithm = 'aes-256-cbc' }: EncrypterOptions) {
    this.key = key
    this.algorithm = algorithm

    this.validateKey()
  }

  /**
   * Ensure the encryption key has a valid length.
   */
  private validateKey (): void {
    if (typeof this.key !== 'string') {
      throw Error(`Invalid encryption key. Received "${typeof this.key}"`)
    }

    if (this.key.length < 32) {
      throw Error(`Encryption key (app key) too short. The key must be at least 32 charachters. Your app key has ${this.key.length} characters.`)
    }
  }

  /**
   * Encrypt the given `value`.
   *
   * @param value
   *
   * @returns {String}
   */
  encrypt (value: any): string {
    const iv = Str.random(use => use.characters().numbers().length(16))

    const cipher = createCipheriv(this.algorithm, this.key, iv)

    const encoded = JSON.stringify(value)
    const encrypted = Buffer.concat([cipher.update(encoded, 'utf8'), cipher.final()])

    /**
     * Concatenating the encryted value, IV, and HMAC using a "dot" is an idea
     * borrowed from JWTs. The dot keeps the individual values separated and
     * we can split them when decrypting a value at a later point in time.
     */
    const result = `${this.base64UrlEncode(encrypted)}.${this.base64UrlEncode(iv)}`

    return `${result}.${this.hmac(result)}`
  }

  /**
   * Base64-encode the given `value` (RFC 4648).
   *
   * @param value
   * @param encoding
   *
   * @returns {String}
   */
  protected base64UrlEncode (value: any): string {
    return this
      .base64Encode(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=/g, '') // eslint-disable-line no-useless-escape
  }

  /**
   * Base64-encode the given `value`.
   *
   * @param value
   * @param encoding
   *
   * @returns {String}
   */
  protected base64Encode (value: any, encoding?: BufferEncoding): string {
    return typeof value === 'string'
      ? Buffer.from(value, encoding).toString('base64')
      : Buffer.from(value).toString('base64')
  }

  /**
   * Returns an HMAC for the given `value`.
   *
   * @param value
   *
   * @returns {String}
   */
  protected hmac (value: string): string {
    return this.base64Encode(
      createHmac('sha256', this.key).update(value).digest()
    )
  }

  /**
   * Determine whether the given `hash` is a valid HMAC for the related `value`.
   *
   * @param hash
   * @param value
   *
   * @returns {Boolean}
   */
  protected isInvalidHmac (hash: string, value: any): boolean {
    return this.hmac(value) !== hash
  }

  /**
   * Decrypt the given `value`.
   *
   * @param value
   *
   * @returns {T | undefined}
   */
  decrypt<T extends any>(value: string): T | undefined {
    if (typeof value !== 'string') {
      throw new Error(`"Encryption.decrypt" expects a string value. Received "${typeof value}"`)
    }

    const [encryptedEncoded, ivEncoded, hmac] = value.split('.')

    if (!encryptedEncoded || !ivEncoded || !hmac) {
      throw new Error('Invalid string value provided to the "decrypt" method, it does not contain the required fields.')
    }

    const encrypted = this.base64UrlDecode(encryptedEncoded, 'hex')
    const iv = this.base64UrlDecode(ivEncoded)

    const result = `${encryptedEncoded}.${ivEncoded}`

    if (this.isInvalidHmac(hmac, result)) {
      throw new Error('Invalid HMAC. Failed to decrypt the given value.')
    }

    const decipher = createDecipheriv(this.algorithm, this.key, iv)
    const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

    return JSON.parse<T>(decrypted) ?? undefined
  }

  /**
   * Base64-decode the given `value`.
   *
   * @param encoded
   * @param outputEncoding
   *
   * @returns {String}
   */
  protected base64UrlDecode (encoded: any, outputEncoding?: BufferEncoding): string {
    return Buffer.from(encoded, 'base64').toString(outputEncoding)
  }
}
