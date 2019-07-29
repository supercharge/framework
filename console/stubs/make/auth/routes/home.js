'use strict'

module.exports = {
  method: 'GET',
  path: '/home',
  options: {
    auth: 'web',
    handler: (_, h) => h.view('home')
  }
}
