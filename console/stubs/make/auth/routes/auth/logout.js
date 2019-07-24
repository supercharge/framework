'use strict'

module.exports = {
  method: 'GET',
  path: '/logout',
  options: {
    auth: 'session',
    handler: (request, h) => {
      request.session.clear()

      return h.redirect('/')
    }
  }
}
