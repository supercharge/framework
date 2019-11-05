'use strict'

const Path = require('path')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')

class ConfigTest extends BaseTest {
  async loadsConfigFromTmpFolder (t) {
    await Config.loadConfigFiles(Path.resolve(__dirname, 'fixtures'))
    t.truthy(Config.config)
    t.is(Object.keys(Config.config).length, 1)
  }

  async emptyConfigFromNonExistentFolder (t) {
    const NewConfig = new Config.constructor()
    await NewConfig.loadConfigFiles(Path.resolve(__dirname, 'non-existent'))

    t.deepEqual(NewConfig.config, {})
  }

  async getConfigValue (t) {
    await Config.loadConfigFiles(Path.resolve(__dirname, 'fixtures'))
    const value = Config.get('testconfig.key')
    t.is(value, 'value')
  }

  async getConfig (t) {
    Config.set('testing', true)
    const config = Config.getConfig()
    t.true(typeof config === 'object')
    t.is(config.testing, true)
  }

  async fallbackValue (t) {
    const value = Config.get('unavailable', 'fallback')
    t.is(value, 'fallback')
  }

  async doesNotThrow (t) {
    const value = Config.get('unavailable')
    t.is(value, undefined)
  }
}

module.exports = new ConfigTest()
