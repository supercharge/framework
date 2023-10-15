
export interface Encrypter {
  /**
   * Encrypt the given `value` using the app key.
   */
  encrypt(value: any): string

  /**
   * Decrypt the given `value` using the app key.
   */
  decrypt<T extends any>(value: string): T | undefined
}
