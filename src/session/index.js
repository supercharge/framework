'use strict'

const SessionManager = require('./manager')

async function register (server) {
  const manager = new SessionManager(server)
  await manager.boot()
}

module.exports.plugin = {
  register
}
