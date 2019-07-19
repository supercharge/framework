'use strict'

const Path = require('path')
const Moment = require('moment')
const Fs = require('../../filesystem')
const Helper = require('../../helper')

class FileDriver {
  constructor (config) {
    const { lifetime, files } = config

    this.lifetime = lifetime
    this.location = files || Helper.storagePath('framework/sessions')
  }

  /**
   * Start the file driver. Ensure
   * the destination directory for
   * session files is available.
   */
  async start () {
    await Fs.ensureDir(this.location)
  }

  /**
   * Stop the file driver. Nothing
   * to do here.
   */
  async stop () {}

  /**
   * Read the session data.
   *
   * @param {String} sessionId
   *
   * @returns {Object}
   */
  async read (sessionId) {
    const file = this._sessionFilePath(sessionId)

    if (await this.isMissing(file)) {
      return {}
    }

    if (await this.isExpired(file)) {
      return {}
    }

    return JSON.parse(
      await Fs.readFile(file)
    )
  }

  /**
   * Determines whether the session file is not existing.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  async isMissing (file) {
    return !await Fs.exists(file)
  }

  /**
   * Determines whether the session file is older
   * than the allowed session lifetime.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  async isExpired (file) {
    const lastModified = await Fs.lastModified(file)

    return lastModified < Moment().subtract(this.lifetime, 'minutes').toDate()
  }

  /**
   * Store session data in a file.
   *
   * @param {String} sessionId
   * @param {Object} values
   */
  async write (sessionId, values) {
    await Fs.writeFile(this._sessionFilePath(sessionId), JSON.stringify(values))
  }

  /**
   * Keep session data alive by updating
   * the last modified time.
   *
   * @param {String} sessionId
   * @param {Object} values
   */
  async touch (sessionId, values) {
    const time = new Date()
    const file = this._sessionFilePath(sessionId)

    if (await Fs.exists(file)) {
      return Fs.updateTimestamps(file, time, time)
    }

    await this.write(sessionId, values)
  }

  /**
   * Returns the session file path.
   *
   * @param {String} sessionId
   *
   * @returns {String}
   */
  _sessionFilePath (sessionId) {
    return Path.resolve(this.location, `${sessionId}.json`)
  }
}

module.exports = FileDriver
