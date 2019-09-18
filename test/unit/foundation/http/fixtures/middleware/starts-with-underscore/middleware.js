'use strict'

class Middleware {
  onPreResponse (request, h) {
    const response = request.response.source + ' supercharge middleware'

    return h.response(response).takeover()
  }
}

module.exports = Middleware
