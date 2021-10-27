'use strict'

module.exports = class ErrorHandler {
  handle (ctx, error) {
    if (error.status || error.statusCode) {
      ctx.response.status(error.status || error.statusCode)
    }

    ctx.response.payload(error.message)
  }
}
