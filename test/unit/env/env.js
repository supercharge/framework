'use strict'

const Path = require('path')
const Env = require('../../../env')
const BaseTest = require('../../../base-test')

class EnvTest extends BaseTest {
  before () {
    Env.loadEnvironmentVariables()
  }

  async usesEnvPath (t) {
    process.env.ENV_PATH = Path.resolve(__dirname, 'secrets.env')
    const envFile = Env.envFileName()
    t.is(envFile, process.env.ENV_PATH)
    delete process.env.ENV_PATH
  }

  async loadsEnvFileFromNodeEnv (t) {
    process.env.NODE_ENV = 'temp'
    const envFile = Env.envFileName()
    t.is(envFile, '.env.temp')
  }

  async loadsEnvFileWithoutNodeEnv (t) {
    delete process.env.NODE_ENV
    const envFile = Env.envFileName()
    t.is(envFile, '.env')
  }

  async loadsCustomEnvFile (t) {
    Env.load(Path.resolve(__dirname, 'secrets.env'))
    t.is(Env.get('VALUE'), 'Supercharge')
  }

  async setEnvValue (t) {
    Env.set('Supercharge_TEMP', 'temp-value')
    const value = Env.get('Supercharge_TEMP')
    t.is(value, 'temp-value')
    delete process.env.Supercharge_TEMP
  }

  async returnsUndefined (t) {
    const value = Env.get('NOT_AVAILABLE')
    t.is(value, undefined)
  }

  async returnsFallbackFallback (t) {
    const value = Env.get('NOT_AVAILABLE', 'tmp')
    t.is(value, 'tmp')
  }

  async isProduction (t) {
    t.false(Env.isProduction())

    process.env.NODE_ENV = 'production'
    t.true(Env.isProduction())
  }

  async is (t) {
    process.env.NODE_ENV = 'testing'
    t.false(Env.is('production'))
    t.true(Env.is('testing'))

    process.env.NODE_ENV = 'production'
    t.true(Env.is('production'))
    t.false(Env.is('testing'))

    process.env.NODE_ENV = ''
    t.false(Env.is('local'))

    process.env.NODE_ENV = undefined
    t.false(Env.is('local'))
  }

  async getOrFail (t) {
    const env = new Env.constructor()
    t.throws(() => env.getOrFail())
    const error = t.throws(() => env.getOrFail(null))
    t.true(error.message.includes('Missing environment variable'))

    env.set('UNDEFINED', undefined)
    t.throws(() => env.getOrFail('UNDEFINED'))

    env.set('DB', null)
    t.throws(() => env.getOrFail('DB'))

    env.set('TIMEOUT', 20)
    t.is(env.getOrFail('TIMEOUT'), '20')

    env.set('FALSE', false)
    t.is(env.getOrFail('FALSE'), 'false')

    env.set('USER', 'Marcus')
    t.is(env.getOrFail('USER'), 'Marcus')
  }
}

module.exports = new EnvTest()
