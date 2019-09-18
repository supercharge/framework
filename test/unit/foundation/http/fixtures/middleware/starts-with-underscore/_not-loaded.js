'use strict'

class Middleware {
  onPreResponse (request, h) {
    const response = request.response.source + ' not loaded'

    return h.response(response).takeover()
  }
}

module.exports = Middleware
