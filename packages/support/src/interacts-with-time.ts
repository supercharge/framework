'use strict'

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
    return Math.floor(
      this.now().getTime() / 1000
    )
  }

  /**
   * Add the given number of `seconds` to the `date`.
   *
   * @returns {Date}
   */
  protected addSecondsDelay (date: Date, seconds: number): Date {
    const delayed = new Date(date)
    delayed.setSeconds(date.getSeconds() + seconds)

    return delayed
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
