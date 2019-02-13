'use strict'

const Path = require('path')
const Config = require('../../../../../config')
const Helper = require('../../../../../helper')
const Database = require('../../../../../database')
const BaseTest = require('../../../../../testing/base-test')
const ConnectDatabase = require('../../../../../foundation/http/bootstrap/connect-database')

class ConnectDatabaseTest extends BaseTest {
  async serialConnectToDatabaseWithMongooseDefault (t) {
    Config.set('database.default', 'mongoose')

    const helperStub = this.stub(Helper, 'modelsPath').returns(
      Path.resolve(__dirname, 'fixtures/models')
    )
    const databaseStub = this.stub(Database, 'connect')

    const handler = new ConnectDatabase()
    await handler.extends()

    this.sinon().assert.called(Database.connect)

    helperStub.restore()
    databaseStub.restore()

    t.pass()
  }

  async serialSkipConnectingWithoutModels (t) {
    Config.set('database.default', 'mongoose')

    const helperStub = this.stub(Helper, 'modelsPath').returns(
      Path.resolve(__dirname, 'fixtures/not-existent-model-folder')
    )
    const databaseStub = this.stub(Database, 'connect')

    const handler = new ConnectDatabase()
    await handler.extends()

    this.sinon().assert.notCalled(Database.connect)

    helperStub.restore()
    databaseStub.restore()

    t.pass()
  }

  async serialSkipConnectingWhenDisabled (t) {
    Config.set('database.default', null)

    const databaseStub = this.stub(Database, 'connect')

    const handler = new ConnectDatabase()
    await handler.extends()

    this.sinon().assert.notCalled(Database.connect)

    databaseStub.restore()

    t.pass()
  }
}

module.exports = new ConnectDatabaseTest()
