'use strict'

const Path = require('path')
const Dotenv = require('dotenv')
const Helper = require('./../helper')
const Str = require('@supercharge/strings')
const DotenvExpand = require('dotenv-expand')

/**
 * Manage the application's environment variables. It reads
 * the `.env` file located in the project’s root directory.
 */
class Env {
  /**
   * Initialize the applications environment by reading the .env file.
   */
  loadEnvironmentVariables () {
    this.load(this.envFileName())
    this.load('.env')
  }

  /**
   * Returns the `.env` file name which should be located
   * in the root directory of the project.
   *
   * @returns {String}
   */
  envFileName () {
    if (process.env.ENV_PATH) {
      return process.env.ENV_PATH
    }

    if (!process.env.NODE_ENV) {
      return '.env'
    }

    const envName = process.env.NODE_ENV.toLowerCase()

    return `.env.${envName}`
  }

  /**
   * Load the `.env` file to resolve all* environment variables.
   * DotenvExpand resolves dynamic values inside of the .env file.
   *
   * @param {String} filename
   */
  load (filename) {
    const path = Path.resolve(Helper.appRoot(), filename)
    const env = Dotenv.config({ path })
    DotenvExpand(env)
  }

  /**
   * Returns the value of the request environment variable.
   *
   * @param {String} key
   * @param {String} defaultValue
   *
   * @returns {*}
   */
  get (key, defaultValue) {
    return process.env[key] || defaultValue
  }

  /**
   * This method is similar to the `Env.get` method, except that
   * it throws an error when the value is not existent in the environment.
   *
   * @param {String} key
   *
   * @returns {*}
   *
   * @throws
   */
  getOrFail (key) {
    const value = this.get(key)

    if (this._isEmpty(value)) {
      throw new Error(`Missing environment variable ${key}`)
    }

    return value
  }

  /**
   * Determine whether the given `value` is null or undefined.
   *
   * @param {String} value
   *
   * @returns {Boolean}
   */
  _isEmpty (value) {
    switch (value) {
      case null:
      case 'null':
        return true

      case undefined:
      case 'undefined':
        return true

      default:
        return false
    }
  }

  /**
   * Set the value of an environment variable.
   *
   * @param {String} key
   * @param {String} value
   */
  set (key, value) {
    process.env[key] = value
  }

  /**
   * Determine whether the `NODE_ENV` variable is set to `production`.
   *
   * @returns {Boolean}
   */
  isProduction () {
    return Str(this.get('NODE_ENV', 'development'))
      .lower()
      .equals('production')
  }

  /**
   * Determine whether the `NODE_ENV` variable is set to `testing`.
   *
   * @returns {Boolean}
   */
  isTesting () {
    return Str(this.get('NODE_ENV', 'development'))
      .lower()
      .equals('testing')
  }

  /**
   * Determine whether the `NODE_ENV` variable equals the given `environment`.
   *
   * @param {String} environment
   *
   * @returns {Boolean}
   */
  is (environment) {
    return Str(this.get('NODE_ENV'))
      .lower()
      .equals(environment)
  }
}

module.exports = new Env()
