'use strict'

module.exports = {
  method: 'GET',
  path: '/ignored-route',
  handler: () => {
    return `
      Will not register this route file to the server.
    `
  }
}
