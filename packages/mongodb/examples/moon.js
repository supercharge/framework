'use strict'

const { Database, Model } = require('../dist')
const { connectionString, connectionOptions } = require('./config')

/**
 * ------------------
 * Setup
 * ------------------
 */
const database = new Database(connectionString, connectionOptions)

class User extends Model {
  //
}

database.register(User)

/**
 * ------------------
 * Run
 * ------------------
 */
async function start () {
  await database.connect()

  await User.delete({ $or: [{ name: 'Marcus' }, { name: 'Supercharge' }] })
  await User.create({ name: 'Marcus' })
  await User.create({ name: 'Supercharge' })

  console.log({
    users: await User.all(),
    query: await User.query().where({ name: 'Marcus' })
  })

  await database.disconnect()
}

start()
  .then(() => process.exit(0))
  .catch(error => console.log(error))
