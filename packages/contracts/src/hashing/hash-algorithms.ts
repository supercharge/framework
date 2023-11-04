
/**
 * This `HashAlgorithms` interface defines the supported Node.js hash algorithms.
 * It can also be used in userland projects to extend the default list of hash
 * algorithms, in case this interface doesn’t expose the values you wanted.
 *
 * You can find out which hash algorithms are supported in your environment
 * by using Node.js’ `crypto` module. If you’re using another runtime, it
 * should provide a way to detect supported hash algorithms, too.
 *
 * @see https://futurestud.io/tutorials/node-js-retrieve-the-list-of-supported-hash-algorithms
 *
 * If you’re wondering why we’re not using a TypeScript type alias here: they
 * don’t allow declaration merging, meaning that developers can’t add their
 * own algorithms to the existing type. And that’s usually what you want.
 *
 * @see https://github.com/microsoft/TypeScript/issues/28078
 *
 * You may extend this `HashAlgorithms` interface in your own project like this:
 *
 * @example
 *
 * ```ts
 *  declare module '@supercharge/contracts' {
 *    export interface HashAlgorithms {
 *      'algorithm': 'algorithm'
 *    }
 *  }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HashAlgorithms {
  'RSA-MD5': 'RSA-MD5'
  'RSA-RIPEMD160': 'RSA-RIPEMD160'
  'RSA-SHA1': 'RSA-SHA1'
  'RSA-SHA1-2': 'RSA-SHA1-2'
  'RSA-SHA224': 'RSA-SHA224'
  'RSA-SHA256': 'RSA-SHA256'
  'RSA-SHA3-224': 'RSA-SHA3-224'
  'RSA-SHA3-256': 'RSA-SHA3-256'
  'RSA-SHA3-384': 'RSA-SHA3-384'
  'RSA-SHA3-512': 'RSA-SHA3-512'
  'RSA-SHA384': 'RSA-SHA384'
  'RSA-SHA512': 'RSA-SHA512'
  'RSA-SHA512/224': 'RSA-SHA512/224'
  'RSA-SHA512/256': 'RSA-SHA512/256'
  'RSA-SM3': 'RSA-SM3'
  'blake2b512': 'blake2b512'
  'blake2s256': 'blake2s256'
  'id-rsassa-pkcs1-v1_5-with-sha3-224': 'id-rsassa-pkcs1-v1_5-with-sha3-224'
  'id-rsassa-pkcs1-v1_5-with-sha3-256': 'id-rsassa-pkcs1-v1_5-with-sha3-256'
  'id-rsassa-pkcs1-v1_5-with-sha3-384': 'id-rsassa-pkcs1-v1_5-with-sha3-384'
  'id-rsassa-pkcs1-v1_5-with-sha3-512': 'id-rsassa-pkcs1-v1_5-with-sha3-512'
  'md5': 'md5'
  'md5-sha1': 'md5-sha1'
  'md5WithRSAEncryption': 'md5WithRSAEncryption'
  'ripemd': 'ripemd'
  'ripemd160': 'ripemd160'
  'ripemd160WithRSA': 'ripemd160WithRSA'
  'rmd160': 'rmd160'
  'sha1': 'sha1'
  'sha1WithRSAEncryption': 'sha1WithRSAEncryption'
  'sha224': 'sha224'
  'sha224WithRSAEncryption': 'sha224WithRSAEncryption'
  'sha256': 'sha256'
  'sha256WithRSAEncryption': 'sha256WithRSAEncryption'
  'sha3-224': 'sha3-224'
  'sha3-256': 'sha3-256'
  'sha3-384': 'sha3-384'
  'sha3-512': 'sha3-512'
  'sha384': 'sha384'
  'sha384WithRSAEncryption': 'sha384WithRSAEncryption'
  'sha512': 'sha512'
  'sha512-224': 'sha512-224'
  'sha512-224WithRSAEncryption': 'sha512-224WithRSAEncryption'
  'sha512-256': 'sha512-256'
  'sha512-256WithRSAEncryption': 'sha512-256WithRSAEncryption'
  'sha512WithRSAEncryption': 'sha512WithRSAEncryption'
  'shake128': 'shake128'
  'shake256': 'shake256'
  'sm3': 'sm3'
  'sm3WithRSAEncryption': 'sm3WithRSAEncryption'
  'ssl3-md5': 'ssl3-md5'
  'ssl3-sha1': 'ssl3-sha1'
}

export type HashAlgorithm = keyof HashAlgorithms
