'use strict'

const Logger = require('../../../logging')
const Config = require('../../../config')
const BaseTest = require('../../../base-test')
const MongooseConnector = require('../../../database/mongoose-connector')

class MongooseConnectorTest extends BaseTest {
  before () {
    Config.set('database.connections', {
      mongoose: {
        host: 'localhost',
        port: 27017,
        database: 'supercharge-testing',
        options: { useNewUrlParser: true, useUnifiedTopology: true }
      }
    })
  }

  after () {
    Config.set('database', 'undefined')
  }

  async serialConnectorLifecycle (t) {
    const connector = new MongooseConnector(Config.get('database.connections.mongoose'))

    await connector.connect()
    t.true(connector.isConnected())

    await connector.disconnect()
    t.false(connector.isConnected())
  }

  async serialEnsuresConnectingOnce (t) {
    const connector = new MongooseConnector(Config.get('database.connections.mongoose'))

    await connector.connect()
    await connector.connect()
    t.true(connector.isConnected())

    await connector.disconnect()
    t.true(connector.isNotConnected())
  }

  async serialMongooseFailsToConnectWithBadConnectionString (t) {
    const stub = this.stub(Logger, 'error').returns()

    const connector = new MongooseConnector({
      host: 'wrong',
      port: 27017,
      database: 'not-existent',
      options: { useNewUrlParser: true, useUnifiedTopology: true }
    })

    await connector.disconnect()

    await t.throwsAsync(async () => connector.connect())
    t.false(connector.isConnected())

    stub.restore()
  }

  async serialConnectsWithMongoDbUrl (t) {
    const connector = new MongooseConnector({
      url: 'mongodb://localhost:27017/supercharge-testing',
      options: { useNewUrlParser: true, useUnifiedTopology: true }
    })

    await connector.connect()
    t.true(connector.isConnected())

    await connector.disconnect()
  }

  async throwsWithoutConfig (t) {
    t.throws(() => new MongooseConnector())
  }
}

module.exports = new MongooseConnectorTest()
