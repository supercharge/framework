'use strict'

import { BaseResponse } from 'koa'
import { tap } from '@supercharge/goodies'
import { HttpResponse } from '@supercharge/contracts'

export class Response implements HttpResponse {
  /**
   * Stores the response data.
   */
  private readonly response: BaseResponse

  /**
   * Create a new response instance.
   *
   * @param response
   */
  constructor (response: BaseResponse) {
    this.response = response
  }

  /**
   * Set the response payload.
   */
  payload (payload: any): this {
    return tap(this, () => {
      this.response.body = payload
    })
  }

  /**
   * Set a response header.
   */
  header (key: string, value: string): this {
    return tap(this, () => {
      this.response.set(key, value)
    })
  }

  /**
   * Set a response status.
   */
  status (status: number): this {
    return tap(this, () => {
      this.response.status = status
    })
  }
}
