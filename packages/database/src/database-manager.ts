'use strict'

import * as Knex from 'knex'
import MethodMissing from '@supercharge/method-missing'
import { Application } from '@supercharge/contracts'

export class DatabaseManager extends MethodMissing {
  /**
   * Stores the Knex instance.
   */
  private readonly meta: {
    app: Application

    knex?: Knex
  }

  constructor (app: Application) {
    super()

    this.meta = { app }
  }

  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'db'
  }

  knex (): Knex {
    if (!this.meta.knex) {
      this.createKnexInstance()
    }

    return this.meta.knex
  }

  private createKnexInstance (): Knex {
    return Knex({

    })
  }

  /**
   * Returns the default logging driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.config().get('database.driver', 'console')
  }

  /**
   * Pass through all calls to the facaded instance.
   *
   * @param {String} methodName
   * @param {Array} args
   *
   * @returns {*}
   */
  __call (methodName: string, args: unknown[]): unknown {
    if (this.getFacadeInstance()[methodName]) {
      return this.getFacadeInstance()[methodName](...args)
    }

    throw new Error(`Missing method "${methodName}" on facade ${this.getContainerNamespace()}`)
  }
}
