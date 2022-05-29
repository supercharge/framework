'use strict'

import { Session as SessionContract } from '@supercharge/contracts'

export class Session implements SessionContract {
  private readonly id: string
  /**
   * Create a new session instance.
   */
  constructor () {
    //
    this.id = this.generateId()
  }

  private generateId (): string {
    return '123-random-id'
  }
}
