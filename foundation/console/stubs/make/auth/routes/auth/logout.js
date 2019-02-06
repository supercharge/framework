'use strict'

module.exports = {
  method: 'GET',
  path: '/logout',
  options: {
    auth: 'web',
    handler: (request, h) => {
      request.cookieAuth.clear()

      return h.redirect('/')
    }
  }
}
