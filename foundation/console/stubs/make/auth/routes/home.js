'use strict'

module.exports = {
  method: 'GET',
  path: '/home',
  options: {
    auth: 'session',
    handler: (_, h) => h.view('home')
  }
}
