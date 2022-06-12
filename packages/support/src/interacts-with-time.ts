'use strict'

import { tap } from '@supercharge/goodies'

export class InteractsWithTime {
  /**
   * Returns the current time as a date instance.
   *
   * @returns {Date}
   */
  protected now (): Date {
    return new Date()
  }

  /**
   * Returns the current time as a UNIX timestamp.
   *
   * @returns {Number}
   */
  protected currentTime (): number {
    return this.now().getTime()
  }

  /**
   * Returns the current time as a UNIX timestamp.
   *
   * @returns {Date}
   */
  protected addSecondsDelay (date: Date, seconds: number): Date {
    return tap(date, () => {
      date.setSeconds(date.getSeconds() + seconds)
    })
  }

  /**
   * Returns the "available at" UNIX timestamp with the added `delay` in seconds.
   *
   * @param {Date | Number | String} delay
   *
   * @returns {Number}
   */
  protected availableAt (delay: Date | number): number {
    if (delay instanceof Date) {
      return delay.getTime()
    }

    return this.addSecondsDelay(this.now(), delay).getTime()
  }
}
