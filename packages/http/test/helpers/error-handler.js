'use strict'

module.exports = class ErrorHandler {
  handle (ctx, error) {
    // console.log('Received error in testing error handler', { error })

    ctx.response.status(error.status || error.statusCode || 500)
    ctx.response.payload(error.message)
  }
}
