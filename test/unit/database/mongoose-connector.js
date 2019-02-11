'use strict'

const Config = require('../../../config')
const BaseTest = require('../../../testing/base-test')
const MongooseConnector = require('../../../database/mongoose-connector')

class MongooseConnectorTest extends BaseTest {
  before () {
    Config.set('database.connections', {
      mongoose: {
        host: 'localhost',
        port: 27017,
        database: 'boost'
      }
    })
  }

  after () {
    Config.set('database', 'undefined')
  }

  async connectorLifecycle (t) {
    const connector = new MongooseConnector(Config.get('database.connections.mongoose'))

    await connector.connect()
    t.true(await connector.isConnected())

    await connector.close()
    t.false(await connector.isConnected())
  }

  async mongooseFailsToConnectWithBadConnectionString (t) {
    const connector = new MongooseConnector({
      host: 'wrong',
      port: 27017,
      database: 'not-existent',
      options: {
        useNewUrlParser: true
      }
    })

    await connector.connect()

    t.false(await connector.isConnected())
  }

  async throwsWithoutConfig (t) {
    t.throws(() => new MongooseConnector())
  }
}

module.exports = new MongooseConnectorTest()
