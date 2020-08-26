'use strict'

import { Application, Bootstrapper } from '@supercharge/contracts'

export = class AuthBootstrapper implements Bootstrapper {
  /**
   * Theh application instance.
   */
  protected app: Application

  constructor (app: Application) {
    this.app = app
  }

  /**
   * Bootstrap the given application.
   *
   * @param {Application} app
   */
  async bootstrap (): Promise<void> {
    await this.loadAuthSchemes()
    await this.loadAuthStrategies()
    await this.setDefaultAuthStrategy()
  }

  /**
   * Load the authentication schemes.
   */
  async loadAuthSchemes (): Promise<void> {
    // TODO
  }

  /**
   * Load the authentication strategies.
   */
  async loadAuthStrategies (): Promise<void> {
    // TODO
  }

  /**
   * Set the default authentication strategy.
   */
  async setDefaultAuthStrategy (): Promise<void> {
    // TODO
  }

  /**
   * Returns the default authentication strategy.
   *
   * @returns {String}
   */
  defaultStrategy (): string {
    return this.app.config().get('auth.default', '')
  }
}
