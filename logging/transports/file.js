'use strict'

const Winston = require('winston')
const Config = require('../../config')
const { combine, timestamp, printf, splat } = Winston.format

/**
 * Configure the Winston file logger with the
 * desired log file and a custom log format
 * that includes the ISO date time.
 */
class FileTransport {
  /**
   * Create a new file logger instance that
   * saves the readable UTC time besides
   * the unix time stamp.
   */
  constructor () {
    this.config = Config.get('logging.channels.file')
  }

  /**
   * Create a Winston file transporter.
   *
   * @returns {Object}
   */
  createTransporter () {
    return new Winston.transports.File({
      filename: this.config.path,
      level: this.config.level,
      format: combine(
        splat(),
        timestamp(),
        printf(info => {
          return JSON.stringify(
            Object.assign(info, { time: new Date(info.timestamp).getTime() })
          )
        })
      )
    })
  }
}

module.exports = FileTransport
