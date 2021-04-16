'use strict'

import { Manager } from '@supercharge/manager'

export class DatabaseManager extends Manager {
  /**
   * Returns the container binding name.
   *
   * @returns {String}
   */
  getContainerNamespace (): string {
    return 'db'
  }

  /**
   * Returns the default logging driver name.
   *
   * @returns {String}
   */
  protected defaultDriver (): string {
    return this.config().get('database.driver', 'console')
  }
}
