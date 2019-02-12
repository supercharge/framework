'use strict'

exports.plugin = {
  name: 'testing',
  register: (server) => { server.testing = 'Supercharge' }
}
