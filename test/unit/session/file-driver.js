'use strict'

const Path = require('path')
const Fs = require('../../../filesystem')
const BaseTest = require('../../../base-test')
const FileDriver = require('../../../session/driver/file')

class SessionFileDriverTest extends BaseTest {
  _files () {
    return Path.resolve(__dirname, 'fixtures/sessions')
  }

  _options () {
    return {
      lifetime: '2h',
      files: this._files()
    }
  }

  _sessionId () {
    const [min, max] = [1, 123456]

    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async after () {
    await Fs.remove(this._files())
  }

  async driverStartsAndStops (t) {
    const driver = new FileDriver(this._options())
    await driver.start()
    t.true(await Fs.exists(this._files()))
    await driver.stop()
  }

  async ensuresLocationWhenStarting (t) {
    const driver = new FileDriver(this._options())
    await driver.start()
    t.true(await Fs.exists(this._files()))
  }

  async hasDefaultLocation (t) {
    const driver = new FileDriver({})
    t.truthy(driver.location)
  }

  async returnsEmptyObjectWhenFileIsMissing (t) {
    const driver = new FileDriver(this._options())
    t.deepEqual(await driver.read(1), {})
  }

  async writeAndReadSessionValues (t) {
    const driver = new FileDriver(this._options())
    await driver.start()

    const sessionId = this._sessionId()
    await driver.write(sessionId, 'Supercharge')
    t.deepEqual(await driver.read(sessionId), 'Supercharge')
  }

  async returnsEmptyObjectWhenSessionExpires (t) {
    const driver = new FileDriver(this._options())
    driver.lifetime = -1
    await driver.start()

    const sessionId = this._sessionId()
    await driver.write(sessionId, 'Supercharge')

    t.deepEqual(await driver.read(sessionId), {})
  }

  async touchSession (t) {
    const driver = new FileDriver(this._options())
    await driver.start()

    const sessionId = this._sessionId()
    await driver.touch(sessionId, 'Supercharge')

    const session = await driver.read(sessionId)
    t.deepEqual(session, 'Supercharge')

    await driver.touch(sessionId, 'New Supercharge')
    t.deepEqual(session, 'Supercharge')
  }
}

module.exports = new SessionFileDriverTest()
