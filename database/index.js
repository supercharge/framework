'use strict'

const Config = require('../config')
const Collect = require('@supercharge/collections')
const MongooseConnector = require('./mongoose-connector')

/**
 * The database manager is responsible to manage the database
 * lifecycle for individual connections. On server stop,
 * this manager closes all existing connections.
 */
class DatabaseManager {
  /**
   * Create a new DatabaseManager instance and
   * initialize an empty connections object.
   */
  constructor () {
    this.connections = {}
  }

  /**
   * Connect to a database using a named configuration. The `name`
   * parameter must match a database configuration. If no name
   * is provided, it connects to the default database.
   *
   * @param {String} name
   */
  async connect (name) {
    if (!this.hasConnection(name)) {
      await this.connection(name).connect()
    }
  }

  /**
   * Close database connections. Use the `name` parameter to
   * specify the named connection to close. You can also pass
   *  an array of named connection to close all at once.
   *
   * @param {String|Array} name
   */
  async close (name) {
    const connectionNames = name || Object.keys(this.connections)

    await Collect(connectionNames)
      .map(name => {
        return { name, connection: this.connections[name] }
      })
      .filter(({ connection }) => connection)
      .forEach(async ({ name, connection }) => {
        await connection.disconnect()
        delete this.connections[name]
      })
  }

  /**
   * Returns a connection instance specified by `name` or
   * the default connection if the `name` is unavailable.
   * Creates a connection instance if not existent.
   *
   * @param {String} name
   *
   * @returns {Object}
   */
  connection (name = this.defaultConnection()) {
    if (!this.hasConnection(name)) {
      this.createNewConnection(name)
    }

    return this.connections[name]
  }

  /**
   * Determines whether a connection for `name` exists.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  hasConnection (name) {
    return !!this.connections[name]
  }

  /**
   * Create a new connection instance base on
   * a connector. Throws if no connector
   * matches the name.
   *
   * @param {String} name
   *
   * @throws
   */
  createNewConnection (name) {
    const connector = this.connector(name)
    this.addConnection(name, connector)
  }

  /**
   * Creates a connector instance.
   *
   * @param {String} name
   */
  connector (name) {
    const config = this.configuration(name)
    const Connector = this.connectors()[name]

    if (!Connector) {
      throw new Error(`No database connector available for "${name}". Available connectors: [${Object.keys(this.connectors())}]`)
    }

    return new Connector(config)
  }

  /**
   * Returns an object of available connectors.
   */
  connectors () {
    return {
      mongoose: MongooseConnector
    }
  }

  /**
   * Returns the connection configuration specified
   * by `name`. Throws an error if there is no
   * configuration available for the given `name`.
   *
   * @param {String} name
   *
   * @returns {Object}
   *
   * @throws
   */
  configuration (name = this.defaultConnection()) {
    const config = Config.get(`database.connections.${name}`)

    if (!config) {
      throw new Error(`No database configuration available for "${name}".`)
    }

    return config
  }

  /**
   * Returns the name of the default database configuration.
   *
   * @returns {String}
   */
  defaultConnection () {
    return Config.get('database.default')
  }

  /**
   * Adds a new connection to the database manager.
   * Throws if there is a connection with the same
   * name or the connection's value is undefined.
   *
   * @param {String} name
   * @param {Object} connection
   *
   * @throws
   */
  addConnection (name, connection) {
    if (this.connections[name]) {
      throw new Error(`Database connection with name "${name}" is already registered.`)
    }

    if (!name) {
      throw new Error('Database connector name is required but missing.')
    }

    if (!connection) {
      throw new Error('Database connector instance is required but missing.')
    }

    this.connections[name] = connection
  }
}

const Database = new DatabaseManager()

module.exports = Database
module.exports.Database = Database
module.exports.Mongoose = require('mongoose')
