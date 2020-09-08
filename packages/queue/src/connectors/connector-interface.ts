'use strict'

import { Queue } from '@supercharge/contracts'

export interface ConnectorInterface {
  /**
   * Establish a queue connection.
   *
   * @param {Object} config
   *
   * @returns {Queue}
   */
  connect (config: any): Queue
}
