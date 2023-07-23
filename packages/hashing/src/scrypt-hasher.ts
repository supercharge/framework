'use strict'

// @ts-expect-error "@phc/format" doesn’t provide type definitions
import Phc from '@phc/format'
import { promisify } from 'node:util'
import type { BinaryLike, ScryptOptions } from 'node:crypto'
import { ScryptValidationError } from './scrypt-validation-error'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { Hasher as HasherContract, HashConfig } from '@supercharge/contracts'

type RequiredHashConfig = Required<HashConfig>

interface ParsedValue {
  id: string
  salt: string
  hash: string
  params: {
    n: number
    r: number
    p: number
  }
}

const randomBytesAsync = promisify(randomBytes)

const scryptDefaultConfig = Object.freeze({
  cost: 16384,
  blockSize: 8,
  saltSize: 16,
  keyLength: 64,
  parallelization: 1,
  maxMemory: 32 * 1024 * 1024,
})

export class ScryptHasher implements HasherContract {
  /**
   * Stores a list of IDs to find in a hash to know whether it belongs to this driver.
   */
  private readonly ids: string[] = ['scrypt']

  /**
   * Stores the scrypt config object.
   */
  private readonly config: Required<RequiredHashConfig['scrypt']>

  private readonly scryptOptions: ScryptOptions
  /**
   * Stores an object of parameter mappings between the hashed value and defined scrypt config.
   */
  private readonly params: Record<'cost' | 'blockSize' | 'parallelization', keyof ParsedValue['params']> = {
    cost: 'n',
    blockSize: 'r',
    parallelization: 'p',
  }

  /**
   * Create a new instance.
   */
  constructor (config: HashConfig['scrypt'] = {}) {
    this.validateConfig(config)
    this.config = { ...scryptDefaultConfig, ...config }

    this.scryptOptions = {
      cost: this.config.cost,
      maxmem: this.config.maxMemory,
      blockSize: this.config.blockSize,
      parallelization: this.config.parallelization,
    }
  }

  /**
   * Validates the provided scrypt hash config and throws an error when finding invalid values.
   */
  private validateConfig (values: HashConfig['scrypt'] = {}): void {
    if (values.cost && (values.cost < 1 || values.cost % 2 !== 0)) {
      throw new ScryptValidationError('The "cost" option must be a power of 2 greater than 1')
    }

    if (values.parallelization && (values.parallelization < 1 || values.parallelization > Number.MAX_SAFE_INTEGER)) {
      throw new ScryptValidationError(
        `The "parallelization" option must be in the range (1 <= parallelization <= ${Number.MAX_SAFE_INTEGER})`
      )
    }

    const maxMemory = 128 * (values.cost ?? scryptDefaultConfig.cost) * (values.blockSize ?? scryptDefaultConfig.blockSize)

    if (values.maxMemory && values.maxMemory < maxMemory) {
      throw new ScryptValidationError(
        `The "maxMemory" option must be less than ${maxMemory}, found ${String(values.maxMemory)}`
      )
    }

    if (values.saltSize && (values.saltSize < 16 || values.saltSize > 1024)) {
      throw new ScryptValidationError('The "saltSize" option must be in the range (16 <= saltSize <= 1024)')
    }

    if (values.keyLength && (values.keyLength < 64 || values.keyLength > 128)) {
      throw new ScryptValidationError('The "keyLength" option must be in the range (64 <= keylen <= 128)')
    }
  }

  /**
   * Hash the given `value`.
   *
   * @param value
   *
   * @returns {String}
   */
  async make (value: string): Promise<string> {
    const salt = await randomBytesAsync(this.config.saltSize)
    const hash = await this.scrypt(value, salt, this.scryptOptions)

    return Phc.serialize({
      id: this.ids[0],
      params: {
        n: this.config.cost,
        r: this.config.blockSize,
        p: this.config.parallelization,
      },
      salt,
      hash
    })
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  private async scrypt (value: BinaryLike, salt: BinaryLike, options: ScryptOptions): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      scrypt(value, salt, this.config.keyLength, options, (error, derivedKey) => {
        if (error) {
          return reject(error)
        }

        resolve(derivedKey)
      })
    })
  }

  /**
   * Compare a the `plain` text value against the given `hashedValue`.
   */
  async check (plain: string, hashedValue: string): Promise<boolean> {
    let deserializedHash: ParsedValue

    try {
      deserializedHash = Phc.deserialize(hashedValue)
    } catch (error) {
      throw new ScryptValidationError('Received invalid scrypt "hash" value. It must be a valid PHC string')
    }

    if (deserializedHash.id && !this.ids.includes(deserializedHash.id)) {
      throw new ScryptValidationError(`Incompatible ${String(deserializedHash.id)} identifier found in the hash`)
    }

    if (deserializedHash.params && typeof deserializedHash.params !== 'object') {
      throw new ScryptValidationError('The "param" attribute must be an object and cannot be empty')
    }

    // cost validation
    if (typeof deserializedHash.params.n !== 'number' || !Number.isInteger(deserializedHash.params.n)) {
      throw new ScryptValidationError('The "n" parameter must be an integer')
    }

    if (deserializedHash.params.n < 1 || deserializedHash.params.n % 2 !== 0) {
      throw new ScryptValidationError('The "n" parameter must be a power of 2 greater than 1')
    }

    // blockSize validation
    if (typeof deserializedHash.params.r !== 'number' || !Number.isInteger(deserializedHash.params.r)) {
      throw new ScryptValidationError("The 'r' parameter must be an integer")
    }

    // parallelization validation
    if (typeof deserializedHash.params.p !== 'number' || !Number.isInteger(deserializedHash.params.p)) {
      throw new ScryptValidationError('The "p" parameter must be an integer')
    }

    if (deserializedHash.params.p < 1 || deserializedHash.params.p > Number.MAX_SAFE_INTEGER) {
      throw new ScryptValidationError(`The "p" parameter must be in the range (1 <= parallelization <= ${Number.MAX_SAFE_INTEGER})`)
    }

    if (typeof deserializedHash.salt === 'undefined') {
      throw new ScryptValidationError('Missing "salt" in the given hashed value')
    }

    if (typeof deserializedHash.hash === 'undefined') {
      throw new ScryptValidationError('Missing "hash" in the given hashed value')
    }

    const derivedKey = await this.scrypt(plain, deserializedHash.salt, {
      maxmem: this.config.maxMemory,
      cost: deserializedHash.params.n,
      blockSize: deserializedHash.params.r,
      parallelization: deserializedHash.params.p,
    })

    return timingSafeEqual(
      Buffer.from(deserializedHash.hash), derivedKey
    )
  }

  /**
   * Determine whether the given hash value has been hashed using the configured options.
   *
   * @param {String} hashedValue
   *
   * @returns {Boolean}
   */
  needsRehash (hashedValue: string): boolean {
    if (typeof hashedValue !== 'string') {
      throw new ScryptValidationError('You must provide a string value as an argument to the "needsRehash" method.')
    }

    let deserializedHash: ParsedValue

    try {
      deserializedHash = Phc.deserialize(hashedValue)
    } catch (error) {
      return true
    }

    return (Object.keys(this.params) as unknown as Array<keyof ScryptHasher['params']>).some((key) => {
      const k = this.params[key]
      const param = deserializedHash.params[k]

      return param !== this.config[key]
    })
  }
}
