'use strict'

import _ from 'lodash'
import Str from '@supercharge/strings'
import { Arr } from '@supercharge/arrays'
import { Session as SessionContract, SessionDriver } from '@supercharge/contracts'

export class Session implements SessionContract {
  /**
   * Stores the session ID.
   */
  protected sessionId: string

  /**
   * Stores the session ID for the current request.
   */
  protected originalSessionId: string

  /**
   * Determine whether the session ID has been regenerated.
   */
  protected hasRegeneratedSessionId: boolean = false

  /**
   * Stores the session name.
   */
  protected readonly sessionName: string

  /**
   * Stores the session driver instance.
   */
  protected readonly driver: SessionDriver

  /**
   * Stores the session data.
   */
  protected attributes: Record<string, any>

  /**
   * Create a new session instance.
   */
  constructor (driver: SessionDriver, name: string, id?: string) {
    this.sessionId = ''
    this.originalSessionId = ''

    this.attributes = {}
    this.driver = driver
    this.sessionName = name

    this.setId(id)
  }

  /**
   * Returns the session ID.
   */
  id (): string {
    return this.sessionId
  }

  /**
   * Returns the session name.
   */
  name (): string {
    return this.sessionName
  }

  /**
   * Assign the given `id` as the session ID. If the given `id` is not
   * a valid alpha-numeric string consisting of 40 characters, this
   * method generates a new session ID and ignores the given `id`.
   */
  setId (id?: string): this {
    this.sessionId = this.isValidId(id)
      ? id
      : this.generateRandomToken()

    if (!this.hasRegeneratedSessionId) {
      this.originalSessionId = this.sessionId
    }

    return this
  }

  /**
   * Determine whether the given `id` is a valid session id.
   *
   * @returns {String}
   */
  protected isValidId (id?: string): id is string {
    return Str.isAlphaNumeric(id) && Str(id).hasLength(40)
  }

  /**
   * Returns a new, random alpha-numeric token.
   *
   * @returns {String}
   */
  protected generateRandomToken (): string {
    return Str.random(use => {
      return use.characters().numbers().length(40)
    })
  }

  /**
   * Returns all of the session data.
   */
  all (): Record<string, any> {
    return this.attributes
  }

  /**
   * Returns the session item for the given `key`.
   */
  get<R = any>(key: string, defaultValue?: R): R {
    return _.get(this.attributes, key, defaultValue)
  }

  /**
   * Determine whether the session contains an entry for the given `key`.
   */
  has (key: string): boolean {
    return _.has(this.attributes, key)
  }

  /**
   * Returns the session item for the given `key` and removes it from the session data.
   */
  pull<R = any>(key: string, defaultValue?: R): R {
    const value = this.get(key, defaultValue)
    this.delete(key)

    return value
  }

  /**
   * Put a key-value-pair or an object of key-value-pairs to the session.
   * This is an alias for the `set` method.
   */
  put (key: string | Record<string, any>, value?: any): this {
    return this.set(key, value)
  }

  /**
   * Put a key-value-pair or an object of key-value-pairs into the session.
   */
  set (key: string | Record<string, any>, value?: any): this {
    typeof key === 'object'
      ? _.merge(this.attributes, key)
      : _.set(this.attributes, key, value)

    return this
  }

  /**
   * Remove all `keys` from the session. Clears the session when no `keys` are provided.
   */
  delete (...keys: string[] | string[][]): this {
    const keysToDelete = ([] as string[]).concat(...keys)

    return keysToDelete.length > 0
      ? this.forget(...keys)
      : this.clear()
  }

  /**
   * Remove one or more items from the session.
   */
  forget (...keys: string[] | string[][]): this {
    ([] as string[]).concat(...keys).forEach(key => {
      _.unset(this.attributes, key)
    })

    return this
  }

  /**
   * Removes all items from the session.
   */
  clear (): this {
    this.attributes = {}

    return this
  }

  /**
   * Push a the given `value` onto a session array stored for the given `key`.
   */
  push (key: string, value: any): this {
    const val = this.get<any[]>(key, [])

    val.push(value)

    return this.set(key, val)
  }

  /**
   * Flash a key-value-pair or an object of key-value-pairs to the session.
   */
  flash (values: Record<string, any>): this
  flash (key: string, value: any): this
  flash (key: string | Record<string, any>, value?: any): this {
    this.set(key, value)

    const keys = typeof key === 'string'
      ? [key]
      : Object.keys(key)

    keys.forEach(key => this.push('__flash_new__', key))

    return this.removeFromOldFlashData(keys)
  }

  /**
   * Reflash all the session’s flash data or the given `keys`.
   */
  reflash (...keys: string[] | string[][]): this {
    const flashes = ([] as string[]).concat(...keys)

    const keep = flashes.length > 0
      ? flashes
      : this.get('__flash_old__', [])

    return this
      .mergeNewFlashes(keep)
      .removeFromOldFlashData(keep)
  }

  /**
   * Merge new flash keys into the new flash array.
   */
  protected mergeNewFlashes (keys: string[]): this {
    const newFlashes = Arr.from(
      this.get<string[]>('__flash_new__', [])
    ).concat(keys).unique().toArray()

    return this.put('__flash_new__', newFlashes)
  }

  /**
   * Remove the given `keys` from the old flash data.
   */
  protected removeFromOldFlashData (keys: string[]): this {
    const old = Arr.from(
      this.get('__flash_old__', ([] as string[]))
    ).diff(keys).toArray()

    return this.set('__flash_old__', old)
  }

  /**
   * Age the flash data for the session.
   */
  ageFlashData (): this {
    const oldFlashes = this.get('__flash_old__', [])
    const newFlashes = this.get('__flash_new__', [])

    if (Arr.from(oldFlashes).concat(newFlashes).isEmpty()) {
      return this
    }

    return this
      .forget(oldFlashes)
      .put('__flash_old__', newFlashes)
      .put('__flash_new__', [])
  }

  /**
   * Generate a new session ID.
   */
  regenerate (): this {
    this.hasRegeneratedSessionId = true

    this.setId(
      this.generateRandomToken()
    )

    return this
  }

  /**
   * Removes all items from the session and regenerates the ID.
   */
  invalidate (): this {
    return this.clear().regenerate()
  }

  /**
   * Returns the CSRF token value.
   */
  token (): string {
    return this.get('__token__')
  }

  /**
   * Regenerate the CSRF token value.
   *
   * @returns {this}
   */
  regenerateToken (): this {
    this.set('__token__', this.generateRandomToken())

    return this
  }

  /**
   * Starte the session and read the session from a storage.
   */
  async start (): Promise<this> {
    this.attributes = await this.driver.read(this.sessionId)

    if (!this.has('__token__')) {
      this.regenerateToken()
    }

    return this
  }

  /**
   * Save the session data to a storage.
   */
  async commit (): Promise<this> {
    this.ageFlashData()

    await this.cleanOldSession()
    await this.driver.write(this.sessionId, this.attributes)

    return this
  }

  /**
   * Clean up session data for the original session ID. The session ID changes
   * when generating a new session ID and migrating the data to it. Cleaning
   * the old data keeps the session store clean from old, outdated values.
   */
  protected async cleanOldSession (): Promise<void> {
    if (this.hasRegeneratedSessionId) {
      await this.driver.destroy(this.originalSessionId)
    }
  }
}
