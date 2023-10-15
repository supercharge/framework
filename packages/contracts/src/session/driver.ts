
export interface SessionDriver {
  /**
   * Read the session data.
   */
  read (sessionId: string): Promise<Record<string, any>>

  /**
   * Store the session data.
   */
  write(sessionId: string, values: Record<string, any>): Promise<this>

  /**
   * Delete the session data for the given `sessionId`.
   */
  destroy(sessionId: string): Promise<this>
}
