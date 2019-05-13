'use strict'

const Path = require('path')
const Config = require('../../../config')
const Helper = require('../../../helper')
const Database = require('../../../database')
const BaseTest = require('../../../base-test')
const ConnectionLifecycle = require('../../../src/database/middleware/connection-lifecycle')

class DatabaseConnectionLifecycleTest extends BaseTest {
  async serialStartConnection (t) {
    Config.set('database.default', 'mongoose')
    Config.set('database.connections', { mongoose: { database: 'boost' } })
    this.modelsPathStub = this.stub(Helper, 'modelsPath').returns(Path.resolve(__dirname, 'fixtures/models'))

    const lifecycle = new ConnectionLifecycle()
    await lifecycle.onPreStart()

    const connection = Database.connection('mongoose')
    t.true(await connection.isConnected())

    await lifecycle.onPostStop()
    t.false(await connection.isConnected())

    this.modelsPathStub.restore()
  }

  async serialNotConnectingWithoutDefaultDriver (t) {
    Config.set('database.default', false)
    this.modelsPathStub = this.stub(Helper, 'modelsPath').returns(Path.resolve(__dirname, 'fixtures/models'))

    const lifecycle = new ConnectionLifecycle()
    await lifecycle.onPreStart()

    const connection = Database.connection('mongoose')
    t.false(await connection.isConnected())
    t.true(await lifecycle.hasModels())

    this.modelsPathStub.restore()
  }

  async serialNotConnectingWithoutModels (t) {
    Config.set('database.default', 'mongoose')
    this.modelsPathStub = this.stub(Helper, 'modelsPath').returns(Path.resolve(__dirname, 'fixtures/no-models'))

    const lifecycle = new ConnectionLifecycle()
    await lifecycle.onPreStart()

    const connection = Database.connection('mongoose')
    t.false(await connection.isConnected())
    t.false(await lifecycle.hasModels())

    this.modelsPathStub.restore()
  }
}

module.exports = new DatabaseConnectionLifecycleTest()
