
import { Manager } from '@supercharge/manager'
import { Application, Hasher, HashConfig } from '@supercharge/contracts'

export class HashManager extends Manager<Application> implements Hasher {
  /**
   * Returns the hashing config.
   */
  protected config (): HashConfig {
    return this.app.config().get<HashConfig>('hashing')
  }

  /**
   * Returns the default hashing driver name.
   */
  protected defaultDriver (): string {
    return this.config().driver
  }

  /**
   * Create a bcrypt hasher instance.
   */
  protected createBcryptDriver (): Hasher {
    const BcryptHasher = this.config().drivers.bcrypt

    return new BcryptHasher({
      rounds: this.app.config().get('hashing.bcrypt.rounds', 10)
    })
  }

  /**
   * Create an scrypt hasher instance.
  */
  protected createScryptDriver (): Hasher {
    const ScryptHasher = this.config().drivers.scrypt

    return new ScryptHasher(
      this.config().scrypt
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
}
