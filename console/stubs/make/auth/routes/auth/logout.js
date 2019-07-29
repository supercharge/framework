'use strict'

module.exports = {
  method: 'GET',
  path: '/logout',
  options: {
    auth: 'web',
    handler: (request, h) => {
      request.session.forget('userId')

      return h.redirect('/')
    }
  }
}
