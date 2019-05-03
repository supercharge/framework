'use strict'

const Path = require('path')
const Moment = require('moment')
const Bourne = require('@hapi/bourne')
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
   * @param {String} key
   *
   * @returns {Object}
   */
  async read (key) {
    const file = this._sessionFile(key)

    if (await Fs.exists(file)) {
      if (await Fs.lastModified(file) >= Moment().subtract(this.lifetime, 'minutes').toDate()) {
        return Bourne.parse(
          await Fs.readFile(this._sessionFile(key))
        )
      }
    }

    return {}
  }

  /**
   * Store session data in a file.
   *
   * @param {String} key
   * @param {Object} values
   */
  async write (key, values) {
    await Fs.writeFile(this._sessionFile(key), JSON.stringify(values))
  }

  /**
   * Keep session data alive by updating
   * the last modified time.
   *
   * @param {String} key
   * @param {Object} values
   */
  async touch (key, values) {
    const time = Date.now()
    const file = this._sessionFile(key)

    if (await Fs.exists(file)) {
      return Fs.updateTimestamps(file, time, time)
    }

    await this.write(key, values)
  }

  /**
   * Returns the session file path.
   *
   * @param {String} key
   *
   * @returns {String}
   */
  _sessionFile (key) {
    return Path.resolve(this.location, `${key}.json`)
  }
}

module.exports = FileDriver
