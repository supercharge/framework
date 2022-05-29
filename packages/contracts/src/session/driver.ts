'use strict'

export interface SessionDriver {
  /**
   * Read the session from the store.
   */
  read (sessionId: string): Promise<Record<string, any> | undefined>

  /**
   * Store the session data.
   */
  write(sessionId: string, values: Record<string, any>): Promise<this>

  /**
   * Delete the session from the store.
   */
  destroy(sessionId: string): Promise<this>

  /**
   * Keep session fresh.
   */
  touch(sessionId: string): Promise<this>
}
