'use strict'

module.exports = {
  type: 'onPostHandler',
  method: (request, h) => {
    const response = request.response.source + ' supercharge object middleware'

    return h.response(response).takeover()
  }
}
