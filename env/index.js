'use strict'

const _ = require('lodash')
const Path = require('path')
const Dotenv = require('dotenv')
const Helper = require('./../helper')
const DotenvExpand = require('dotenv-expand')

/**
 * Manage the application's environment variables.
 * It reads the `.env` file located in the
 * project's root directory.
 */
class Env {
  /**
   * Initialize the applications environment by
   * reading the .env file.
   */
  loadEnvironmentVariables () {
    this.load(this.envFileName())
    this.load('.env')
  }

  /**
   * Returns the `.env` file name which should
   * be located in the root directory of the
   * project.
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
   * Load the `.env` file to resolve all
   * environment variables. DotenvExpand
   * resolves dynamic values inside of
   * the .env file.
   *
   * @param {String} filename
   */
  load (filename) {
    const path = Path.resolve(Helper.appRoot(), filename)
    const config = Dotenv.config({ path })
    DotenvExpand(config)
  }

  /**
   * Returns the value of the request
   * environment variable.
   *
   * @param {String} key
   * @param {String} defaultValue
   *
   * @returns {Mixed}
   */
  get (key, defaultValue) {
    return _.get(process.env, key, defaultValue)
  }

  /**
   * Set the value of an environment variable.
   *
   * @param {String} key
   * @param {String} value
   */
  set (key, value) {
    _.set(process.env, key, value)
  }

  /**
   * Determines whether the `NODE_ENV` environment
   * variable is set to `production`.
   *
   * @returns {Boolean}
   */
  isProduction () {
    const env = this.get('NODE_ENV', 'development').toLowerCase()

    return env === 'production'
  }

  /**
   * Determines whether the `NODE_ENV` environment
   * variable is set to `testing`.
   *
   * @returns {Boolean}
   */
  isTesting () {
    const env = this.get('NODE_ENV', 'development').toLowerCase()

    return env === 'testing'
  }
}

module.exports = new Env()
