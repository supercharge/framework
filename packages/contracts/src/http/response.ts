'use strict'

export interface HttpResponse {
  /**
   * Set a new response header.
   */
  header(key: string, value: unknown): this

  /**
   * Set the response payload.
   */
  payload(payload: any): this

  /**
   * Set a response status.
   */
  status (status: number): this
}
