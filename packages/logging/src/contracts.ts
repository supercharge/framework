'use strict'

import { Logger } from '@supercharge/contracts'

/**
 * Add container bindings for services from this provider.
 */
declare module '@supercharge/contracts' {
  export interface ContainerBindings {
    'logger': Logger
  }
}
